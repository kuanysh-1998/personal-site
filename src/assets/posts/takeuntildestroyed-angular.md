# takeUntilDestroyed: Automatic Unsubscription in Angular

Every Angular developer has faced it: a component subscribes to an Observable, forgets to unsubscribe, and suddenly there's a memory leak silently degrading performance. Angular 16 introduced `takeUntilDestroyed()` — a native solution that eliminates this entire class of bugs.

## The Memory Leak Problem

When a component subscribes to an Observable and doesn't unsubscribe, the subscription lives on after the component is destroyed. This causes memory leaks, unexpected behavior, and performance degradation.

```typescript
// Memory leak waiting to happen
@Component({...})
export class UserProfileComponent implements OnInit {
  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.user = user; // Still fires after component destroyed
    });
  }
}
```

Navigate away, come back ten times — now you have ten zombie subscriptions all firing callbacks on a destroyed component.

## The Old Solutions

Before Angular 16, we had several ways to handle this. None were ideal.

### Manual Unsubscription

```typescript
@Component({...})
export class UserProfileComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.userService.getUser().subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

**Problems:** Boilerplate. Easy to forget. Multiple subscriptions need array or `Subscription.add()`.

### Subject + takeUntil Pattern

```typescript
@Component({...})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Problems:** Still boilerplate. Must remember `next()` AND `complete()`. Every component needs the same 4 lines.

### Third-Party Libraries

```typescript
// @ngneat/until-destroy
@UntilDestroy()
@Component({...})
export class UserProfileComponent implements OnInit {
  ngOnInit() {
    this.userService.getUser()
      .pipe(untilDestroyed(this))
      .subscribe(user => this.user = user);
  }
}
```

**Problems:** External dependency. Decorator magic. Can break on Angular updates. Extra bundle size.

## Enter takeUntilDestroyed

Angular 16 added `takeUntilDestroyed()` to `@angular/core/rxjs-interop`. Native. Zero dependencies. Just works.

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class UserProfileComponent implements OnInit {
  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user = user);
  }
}
```

No `OnDestroy`. No Subject. No cleanup code. Angular handles everything.

## How It Works

`takeUntilDestroyed()` internally uses `DestroyRef`, which Angular creates for every component, directive, service, and pipe. When the component is destroyed, `DestroyRef` triggers, and the operator completes the Observable.

```typescript
// What happens under the hood (simplified)
function takeUntilDestroyed(destroyRef = inject(DestroyRef)) {
  return <T>(source: Observable<T>) => {
    return new Observable<T>(subscriber => {
      const subscription = source.subscribe(subscriber);
      
      destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
      
      return subscription;
    });
  };
}
```

## Basic Usage

### In Components

```typescript
@Component({
  selector: 'app-dashboard',
  template: `<div>{{ data }}</div>`
})
export class DashboardComponent {
  data: string;

  constructor() {
    this.dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.data = data);
  }
}
```

**Important:** When called without arguments, `takeUntilDestroyed()` must be used in an injection context — constructor, field initializer, or factory function with `inject()`.

### In Services

Works the same way. When the service is destroyed (e.g., a component-provided service), subscriptions clean up automatically.

```typescript
@Injectable()
export class FeatureService {
  private state = signal<Data | null>(null);

  constructor() {
    this.api.fetchData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.state.set(data));
  }
}
```

### Multiple Subscriptions

No arrays, no tracking — just use it on each Observable:

```typescript
constructor() {
  this.userService.currentUser$
    .pipe(takeUntilDestroyed())
    .subscribe(user => this.user = user);

  this.notificationService.notifications$
    .pipe(takeUntilDestroyed())
    .subscribe(notifications => this.notifications = notifications);

  this.themeService.theme$
    .pipe(takeUntilDestroyed())
    .subscribe(theme => this.applyTheme(theme));
}
```

## Using DestroyRef Directly

Sometimes you need to subscribe outside the injection context — in `ngOnInit`, event handlers, or utility functions. Pass `DestroyRef` explicitly.

### In Lifecycle Hooks

```typescript
@Component({...})
export class SearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Outside injection context — pass destroyRef
    this.searchService.results$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(results => this.results = results);
  }
}
```

### In Methods

```typescript
@Component({...})
export class ChartComponent {
  private readonly destroyRef = inject(DestroyRef);

  onFilterChange(filter: Filter) {
    this.chartService.getData(filter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.renderChart(data));
  }
}
```

### In Utility Functions

This is where `takeUntilDestroyed` truly shines — reusable functions that respect component lifecycle:

```typescript
// utils/polling.ts
export function poll<T>(
  source: () => Observable<T>,
  interval: number,
  destroyRef: DestroyRef
): Observable<T> {
  return timer(0, interval).pipe(
    switchMap(() => source()),
    takeUntilDestroyed(destroyRef)
  );
}

// Usage in component
export class StatusComponent {
  private readonly destroyRef = inject(DestroyRef);
  
  status$ = poll(
    () => this.api.getStatus(),
    30000,
    this.destroyRef
  );
}
```

## Real-World Example

Here's a Service Worker update service using `takeUntilDestroyed` for multiple subscriptions:

```typescript
import { Injectable, inject, DestroyRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap, catchError } from 'rxjs/operators';
import { timer, EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  
  private updateAvailable = false;

  checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) return;

    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateAvailable = true;
        this.promptUpdate();
      });

    // Check periodically
    timer(0, 60 * 60 * 1000)
      .pipe(
        switchMap(() => this.swUpdate.checkForUpdate()),
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Check on navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.updateAvailable) {
          this.promptUpdate();
        }
      });
  }

  private promptUpdate(): void {
    // Show update dialog
  }
}
```

Three subscriptions, zero manual cleanup. When the service is destroyed, all subscriptions complete automatically.

## When You Don't Need It

Not every subscription needs `takeUntilDestroyed`. Skip it when:

### HTTP Requests (Single Emission)

HTTP calls complete after one response. No leak possible.

```typescript
// No takeUntilDestroyed needed
this.http.get('/api/data').subscribe(data => this.process(data));
```

**Exception:** If you need to cancel the request when the component is destroyed (e.g., long-running request), then use it.

### Async Pipe

The `async` pipe handles subscription lifecycle automatically:

```typescript
@Component({
  template: `
    @for (item of items$ | async; track item.id) {
      <div>{{ item.name }}</div>
    }
  `
})
export class ListComponent {
  items$ = this.itemService.getItems(); // No manual subscription
}
```

### Signals with toSignal

`toSignal` manages its own cleanup:

```typescript
@Component({...})
export class UserComponent {
  user = toSignal(this.userService.currentUser$);
  // Automatically cleaned up
}
```

## Migrating from @ngneat/until-destroy

If you're using `@ngneat/until-destroy`, migration is straightforward:

**Before:**
```typescript
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({...})
export class MyComponent implements OnInit {
  ngOnInit() {
    this.data$.pipe(untilDestroyed(this)).subscribe();
  }
}
```

**After:**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
```

Or move to constructor:

```typescript
@Component({...})
export class MyComponent {
  constructor() {
    this.data$.pipe(takeUntilDestroyed()).subscribe();
  }
}
```

**Migration checklist:**
- Remove `@ngneat/until-destroy` from `package.json`
- Remove `@UntilDestroy()` decorators
- Replace `untilDestroyed(this)` with `takeUntilDestroyed()`
- For `ngOnInit` subscriptions: inject `DestroyRef` and pass it, or move to constructor

## Common Mistakes

### Using Outside Injection Context

```typescript
// Error: takeUntilDestroyed() called outside injection context
ngOnInit() {
  this.data$.pipe(takeUntilDestroyed()).subscribe(); // Throws!
}
```

**Fix:** Inject `DestroyRef` and pass it:

```typescript
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
}
```

### Operator Order Matters

Place `takeUntilDestroyed` last in the pipe (before `subscribe`):

```typescript
// Correct
this.data$.pipe(
  filter(x => x > 0),
  map(x => x * 2),
  takeUntilDestroyed()
).subscribe();

// Works but less efficient — filtering continues after destroy signal
this.data$.pipe(
  takeUntilDestroyed(),
  filter(x => x > 0),
  map(x => x * 2)
).subscribe();
```

## Key Takeaways

1. **Use `takeUntilDestroyed()`** for any long-lived subscription in components and services
2. **No arguments in injection context** — constructor and field initializers
3. **Pass `DestroyRef`** when subscribing in lifecycle hooks or methods
4. **Skip it** for HTTP requests, async pipe, and `toSignal`
5. **Native solution** — zero dependencies, maintained by Angular team

Memory leaks from forgotten subscriptions are now a solved problem. One import, one operator, zero boilerplate.

---
