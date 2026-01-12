As Angular continues to evolve, staying current with best practices is crucial for building maintainable, performant applications. This guide covers essential patterns and anti-patterns based on real-world experience with Angular 17+.

## Modern Component Architecture

### Embrace Standalone Components

```typescript
// ❌ Old way with NgModule
@NgModule({
  declarations: [UserCard],
  imports: [CommonModule],
})
// ✅ Modern standalone
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
})
export class UserCard {}
```

Standalone components eliminate boilerplate and make dependencies explicit. They're the future of Angular architecture.

### Use OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCard {}
```

**Why?** Angular is moving toward better reactivity with signals and zoneless applications. Using OnPush now makes future migrations easier and improves performance today.

## Reactivity Done Right

### Signals for State Management

```typescript
// ❌ Avoid mutable signals
user = signal<User>({ name: 'martin' });
// Later: user().name = 'john' // Won't trigger updates!

// ✅ Use immutable updates
user.update((prev) => ({ ...prev, name: 'john' }));
```

**Key patterns:**

- `signal()` for writable state
- `computed()` for derived state
- `effect()` for side effects (use sparingly)

### When to Use Signals vs RxJS

**Use Signals for:**

- Component state
- Derived values
- Simple reactivity

**Use RxJS for:**

- Event streams
- Complex async operations
- HTTP requests with cancellation

```typescript
// ✅ Signals for state
currentUser = signal<User | null>(null);
isManager = computed(() => this.currentUser()?.role === 'manager');

// ✅ RxJS for events
searchResults$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((query) => this.searchUsers(query))
);
```

## Common Anti-Patterns to Avoid

### 1. Functions in Templates

```typescript
// ❌ Bad: Function called on every change detection
@for (team of teams; track team.id) {
  <li>{{ getManager(team)?.name }}</li>
}

// ✅ Good: Compute once
managedTeams = computed(() =>
  this.teams().map(team => ({
    ...team,
    manager: team.members.find(m => m.role === 'manager')
  }))
);
```

### 2. Direct DOM Manipulation

```typescript
// ❌ Bad
document.getElementById('my-button')?.click();

// ✅ Good: Use Angular abstractions
button = viewChild<ElementRef>('myButton');
```

### 3. Memory Leaks in Subscriptions

```typescript
// ❌ Bad: No cleanup
ngOnInit() {
  this.data$.subscribe(data => this.process(data));
}

// ✅ Good: Auto cleanup with DestroyRef
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.data$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.process(data));
}

// ✅ Alternative: Use in constructor (injection context)
constructor() {
  this.data$
    .pipe(takeUntilDestroyed())
    .subscribe(data => this.process(data));
}
```

## Forms Best Practices

### Type Your Reactive Forms

```typescript
// ❌ Untyped
form = new FormGroup({
  title: new FormControl(),
});

// ✅ Typed
form = new FormGroup({
  title: new FormControl<string>('', { nonNullable: true }),
});

// ✅ Access controls safely
this.form.controls.title.value; // Type-safe!
```

### Avoid String-Based Access

```typescript
// ❌ Template
<input formControlName="title">

// ✅ Template
<input [formControl]="form.controls.title">
```

## Performance Optimization

### Lazy Load Features

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
  },
];
```

### Track By in Loops

```typescript
// ❌ Bad: Angular recreates DOM on every change
@for (user of users; track $index) {
  <app-user-card [user]="user"/>
}

// ✅ Good: Track by unique ID
@for (user of users; track user.id) {
  <app-user-card [user]="user"/>
}
```

### Use Computed Instead of getters

```typescript
// ❌ Bad: Recalculated on every check
get fullName() {
  return `${this.firstName()} ${this.lastName()}`;
}

// ✅ Good: Cached automatically
fullName = computed(() =>
  `${this.firstName()} ${this.lastName()}`
);
```

## HTTP & API Interaction

### Always Unsubscribe from HTTP

```typescript
// ✅ Even though HTTP completes automatically
this.http
  .get('/api/users')
  .pipe(takeUntilDestroyed())
  .subscribe((users) => this.users.set(users));
```

**Why?** If component destroys before request completes, the callback still runs and may cause errors accessing destroyed properties.

### Use Interceptors for Cross-Cutting Concerns

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = inject(AuthService).token;
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
```

## Routing Best Practices

### Use Resolvers for Data Loading

```typescript
// ❌ Load in component
ngOnInit() {
  this.http.get(`/users/${this.userId()}`)
    .subscribe(user => this.user.set(user));
}

// ✅ Load before navigation
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.params['id']);
};

// Route config
{
  path: 'users/:id',
  component: UserPage,
  resolve: { user: userResolver }
}
```

### Use Guards for Protection

```typescript
export const authenticatedGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) {
    return inject(Router).parseUrl('/login');
  }
  return true;
};
```

## Testing Essentials

**Current State (2025):** Angular testing ecosystem is in transition.

- **Karma/Jasmine** — deprecated but still default
- **Vitest** — fast, experimental Angular support
- **Jest** — fast, no real browser testing

For new projects, consider Vitest despite experimental status.

## Final Thoughts

Angular is moving toward:

- Signal-based reactivity
- Zoneless change detection
- Standalone components everywhere

Adopt these patterns now to stay ahead. Focus on:

1. Immutable state updates
2. OnPush change detection
3. Proper subscription management
4. Type safety everywhere

The framework is getting better, but only if you use it right.
