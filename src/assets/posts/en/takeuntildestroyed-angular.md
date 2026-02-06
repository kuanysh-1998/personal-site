# takeUntilDestroyed: Automatic Unsubscription in Angular

Every Angular developer has faced it: a component subscribes to an Observable, forgets to unsubscribe, and suddenly there's a memory leak silently degrading performance. Angular 16 introduced `takeUntilDestroyed()` — a native solution that eliminates this entire class of bugs.

## The Memory Leak Problem

When a component subscribes to an Observable and doesn't unsubscribe, the subscription lives on after the component is destroyed. This causes memory leaks, unexpected behavior, and performance degradation.

```typescript
// Memory leak waiting to happen
@Component({...})
export class UserProfileComponent implements OnInit {
  public ngOnInit(): void {
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
  private _subscription!: Subscription;

  public ngOnInit(): void {
    this._subscription = this._userService.getUser().subscribe(user => {
      this.user = user;
    });
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
```

**Problems:** Boilerplate. Easy to forget. Multiple subscriptions need array or `Subscription.add()`.

### Subject + takeUntil Pattern

```typescript
@Component({...})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._userService.getUser()
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => this.user = user);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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
  public ngOnInit(): void {
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
import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class UserProfileComponent {
  private readonly _userService = inject(UserService);
  protected user: User | null = null;

  constructor() {
    this._userService.getUser()
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
import { inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `<div>{{ data }}</div>`
})
export class DashboardComponent {
  protected data = '';

  private readonly _dataService = inject(DataService);

  constructor() {
    this._dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.data = data);
  }
}
```

**Important:** When called without arguments, `takeUntilDestroyed()` must be used in an injection context — constructor, field initializer, or factory function with `inject()`.

### In Services

Works the same way. When the service is destroyed (e.g., a component-provided service), subscriptions clean up automatically.

```typescript
import { inject } from '@angular/core';

@Injectable()
export class FeatureService {
  private readonly _state = signal<Data | null>(null);
  private readonly _api = inject(ApiService);

  constructor() {
    this._api.fetchData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this._state.set(data));
  }
}
```

### Multiple Subscriptions

No arrays, no tracking — just use it on each Observable:

```typescript
constructor() {
  this._userService.currentUser$
    .pipe(takeUntilDestroyed())
    .subscribe(user => this.user = user);

  this._notificationService.notifications$
    .pipe(takeUntilDestroyed())
    .subscribe(notifications => this.notifications = notifications);

  this._themeService.theme$
    .pipe(takeUntilDestroyed())
    .subscribe(theme => this._applyTheme(theme));
}
```

## Using DestroyRef Directly

Sometimes you need to subscribe outside the injection context — in `ngOnInit`, event handlers, or utility functions. Pass `DestroyRef` explicitly.

### In Lifecycle Hooks

```typescript
import { inject } from '@angular/core';

@Component({...})
export class SearchComponent implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _searchService = inject(SearchService);

  protected results: Result[] = [];

  public ngOnInit(): void {
    // Outside injection context — pass _destroyRef
    this._searchService.results$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(results => this.results = results);
  }
}
```

### In Methods

```typescript
import { inject } from '@angular/core';

@Component({...})
export class ChartComponent {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _chartService = inject(ChartService);

  protected onFilterChange(filter: Filter): void {
    this._chartService.getData(filter)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(data => this._renderChart(data));
  }

  private _renderChart(data: ChartData): void {
    // ...
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
import { inject } from '@angular/core';

export class StatusComponent {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _api = inject(ApiService);
  
  protected readonly status$ = poll(
    () => this._api.getStatus(),
    30000,
    this._destroyRef
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
  private readonly _swUpdate = inject(SwUpdate);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  
  private _updateAvailable = false;

  public checkForUpdates(): void {
    if (!this._swUpdate.isEnabled) return;

    // Listen for version updates
    this._swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this._updateAvailable = true;
        this._promptUpdate();
      });

    // Check periodically
    timer(0, 60 * 60 * 1000)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError(() => EMPTY),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();

    // Check on navigation
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        if (this._updateAvailable) {
          this._promptUpdate();
        }
      });
  }

  private _promptUpdate(): void {
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
import { inject } from '@angular/core';

export class ListComponent {
  private readonly _itemService = inject(ItemService);
  protected readonly items$ = this._itemService.getItems();
}
```

### Signals with toSignal

`toSignal` manages its own cleanup:

```typescript
@Component({...})
import { inject } from '@angular/core';

export class UserComponent {
  private readonly _userService = inject(UserService);
  protected readonly user = toSignal(this._userService.currentUser$);
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
  public ngOnInit(): void {
    this.data$.pipe(untilDestroyed(this)).subscribe();
  }
}
```

**After:**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private readonly _destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.data$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
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
public ngOnInit(): void {
  this.data$.pipe(takeUntilDestroyed()).subscribe(); // Throws!
}
```

**Fix:** Inject `DestroyRef` and pass it:

```typescript
private readonly _destroyRef = inject(DestroyRef);

public ngOnInit(): void {
  this.data$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
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
