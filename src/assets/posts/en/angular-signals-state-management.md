Signals changed how Angular handles reactivity. No more Zone.js guessing games, no more global change detection sweeps. But most tutorials stop at `signal()`, `computed()`, and `effect()` basics. This post goes further — into practical state management patterns, real component architecture, and the mental shifts that actually matter for production apps.

## Why Signals Exist

Angular's old reactivity model had a fundamental flaw: **Zone.js doesn't know what changed**. It patches every async API (`setTimeout`, `Promise`, `fetch`, event listeners) and tells Angular: "something happened, check everything." Angular then walks the entire component tree top-down, comparing old and new values.

This works. It's also wasteful. In a dashboard with 200+ components, a single button click triggers checks on components that haven't changed.

Signals fix this by making reactivity **explicit and granular**. When a signal changes, Angular knows exactly which computed values depend on it, which effects need to re-run, and which template bindings need updating. No guessing. No unnecessary work.

The reactive graph looks like this:

```
signal(source) → computed(derived) → effect(side effect)
     ↓                  ↓
  template           template
```

Every `signal()` is a **producer**. Every `computed()` is both a **consumer** and a **producer**. Every `effect()` is a pure **consumer**. Dependencies are tracked automatically when you read a signal inside a reactive context.

## The Three Primitives Done Right

### signal() — Mutable State

```typescript
// Primitive values
private readonly _count = signal(0);
private readonly _userName = signal('');

// Objects — always update immutably
private readonly _user = signal<User | null>(null);

// ✅ Correct: immutable update
public updateName(name: string): void {
  this._user.update((prev) => prev ? { ...prev, name } : null);
}

// ❌ Wrong: mutation won't trigger reactivity
public updateNameBroken(name: string): void {
  const user = this._user();
  if (user) {
    user.name = name; // Signal doesn't know this happened
  }
}
```

**Key rule**: Signals use referential equality by default (`Object.is`). Mutating an object's property doesn't change the reference, so the signal won't notify consumers. Always spread or create a new object.

You can override equality checking for complex cases:

```typescript
private readonly _config = signal<AppConfig>(defaultConfig, {
  equal: (a, b) => a.version === b.version,
});
```

### computed() — Derived State

`computed()` is lazy and memoized. It won't recalculate until you read it, and it won't recalculate if dependencies haven't changed.

```typescript
private readonly _employees = signal<Employee[]>([]);
private readonly _searchQuery = signal('');
private readonly _selectedDepartment = signal<string | null>(null);

// Derived: filtered list based on two signals
public readonly filteredEmployees = computed(() => {
  const query = this._searchQuery().toLowerCase();
  const dept = this._selectedDepartment();

  return this._employees().filter((emp) => {
    const matchesQuery = emp.name.toLowerCase().includes(query);
    const matchesDept = !dept || emp.department === dept;
    return matchesQuery && matchesDept;
  });
});

// Derived from derived — chains automatically
public readonly filteredCount = computed(() => this.filteredEmployees().length);
public readonly hasResults = computed(() => this.filteredCount() > 0);
```

**Anti-pattern**: Don't use `computed()` for side effects. It's for pure transformations only.

```typescript
// ❌ Never do this
const bad = computed(() => {
  const data = this._items();
  localStorage.setItem('items', JSON.stringify(data)); // Side effect!
  return data.length;
});
```

### effect() — Side Effects (Use Sparingly)

Effects are the escape hatch for imperative operations. They should be your last resort, not your first tool.

```typescript
@Component({...})
export class SearchComponent {
  private readonly _searchQuery = signal('');

  constructor() {
    // Sync to localStorage
    effect(() => {
      const query = this._searchQuery();
      localStorage.setItem('lastSearch', query);
    });

    // With cleanup
    effect((onCleanup) => {
      const query = this._searchQuery();
      const timerId = setTimeout(() => this._performSearch(query), 300);

      onCleanup(() => clearTimeout(timerId));
    });
  }

  private _performSearch(query: string): void {
    // ...
  }
}
```

**When to use effect():**

- Syncing with `localStorage` / `sessionStorage`
- Logging and analytics
- Integrating with third-party non-reactive libraries
- Manual DOM manipulation (rare with Angular)

**When NOT to use effect():**

- Deriving state → use `computed()` instead
- Updating another signal based on a signal → use `computed()` or `linkedSignal()`

```typescript
// ❌ Anti-pattern: effect as a state synchronizer
private readonly _firstName = signal('');
private readonly _lastName = signal('');
private readonly _fullName = signal('');

constructor() {
  effect(() => {
    this._fullName.set(`${this._firstName()} ${this._lastName()}`);
  });
}

// ✅ Correct: computed for derived state
public readonly fullName = computed(
  () => `${this._firstName()} ${this._lastName()}`
);
```

## Signal-Based Component APIs

### input() Replaces @Input()

```typescript
@Component({
  selector: 'app-employee-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.highlighted]="isManager()">
      <h3>{{ employee().name }}</h3>
      <span>{{ employee().department }}</span>
      @if (showActions()) {
        <button (click)="onDelete()">Delete</button>
      }
    </div>
  `,
})
export class EmployeeCardComponent {
  // Required input — Angular throws if parent doesn't provide it
  public readonly employee = input.required<Employee>();

  // Optional with default
  public readonly showActions = input(true);

  // With transform
  public readonly highlighted = input(false, { transform: booleanAttribute });

  // Derived from input — replaces ngOnChanges entirely
  public readonly isManager = computed(() => this.employee().role === 'manager');

  // Output
  public readonly deleted = output<string>();

  public onDelete(): void {
    this.deleted.emit(this.employee().id);
  }
}
```

**The key win**: No more `ngOnChanges`. Every input is a signal. Derive anything with `computed()`.

### model() — Two-Way Binding as a First-Class Citizen

```typescript
@Component({
  selector: 'app-search-input',
  standalone: true,
  template: `
    <div class="search-wrapper">
      <input
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        [placeholder]="placeholder()"
      />
      @if (value()) {
        <button (click)="value.set('')">✕</button>
      }
    </div>
  `,
})
export class SearchInputComponent {
  // model() = input + output in one
  // Parent uses: [(value)]="searchQuery"
  public readonly value = model('');
  public readonly placeholder = input('Search...');
}
```

Calling `value.set('...')` internally does two things: updates the signal AND emits the change to the parent. No manual `@Output() valueChange` boilerplate.

### viewChild() — Reactive DOM Queries

```typescript
@Component({
  template: `
    <input #searchInput />
    <div #chartContainer></div>
  `,
})
export class DashboardComponent {
  private readonly _searchInput = viewChild<ElementRef>('searchInput');
  private readonly _chartContainer = viewChild.required<ElementRef>('chartContainer');

  constructor() {
    // Replaces ngAfterViewInit completely
    effect(() => {
      const container = this._chartContainer();
      if (container) {
        this._initChart(container.nativeElement);
      }
    });
  }

  public focusSearch(): void {
    this._searchInput()?.nativeElement.focus();
  }

  private _initChart(element: HTMLElement): void {
    // Initialize third-party chart library
  }
}
```

## State Management Patterns

This is where signals really shine. For small-to-medium apps (and even many enterprise ones), you don't need NgRx, NGXS, or any external state library.

### Pattern 1: Service as Store

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  // Private writable state
  private readonly _employees = signal<Employee[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedId = signal<string | null>(null);

  private readonly _http = inject(HttpClient);
  private readonly _destroyRef = inject(DestroyRef);

  // Public read-only signals
  public readonly employees = this._employees.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  // Derived state
  public readonly selectedEmployee = computed(() => {
    const id = this._selectedId();
    return id ? (this._employees().find((e) => e.id === id) ?? null) : null;
  });

  public readonly employeeCount = computed(() => this._employees().length);

  public readonly departments = computed(() => {
    const unique = new Set(this._employees().map((e) => e.department));
    return [...unique].sort();
  });

  // Actions
  public loadEmployees(): void {
    this._loading.set(true);
    this._error.set(null);

    this._http
      .get<Employee[]>('/api/employees')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (employees) => {
          this._employees.set(employees);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message);
          this._loading.set(false);
        },
      });
  }

  public selectEmployee(id: string | null): void {
    this._selectedId.set(id);
  }

  public addEmployee(employee: Employee): void {
    this._employees.update((prev) => [...prev, employee]);
  }

  public removeEmployee(id: string): void {
    this._employees.update((prev) => prev.filter((e) => e.id !== id));

    // Clear selection if removed employee was selected
    if (this._selectedId() === id) {
      this._selectedId.set(null);
    }
  }

  public updateEmployee(id: string, changes: Partial<Employee>): void {
    this._employees.update((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }
}
```

Usage in component:

```typescript
@Component({
  template: `
    @if (store.loading()) {
      <app-spinner />
    } @else if (store.error(); as error) {
      <app-error [message]="error" />
    } @else {
      <p>{{ store.employeeCount() }} employees</p>
      @for (emp of store.employees(); track emp.id) {
        <app-employee-card
          [employee]="emp"
          [highlighted]="emp.id === store.selectedEmployee()?.id"
          (deleted)="store.removeEmployee($event)"
        />
      }
    }
  `,
})
export class EmployeeListComponent {
  public readonly store = inject(EmployeeStore);

  public ngOnInit(): void {
    this.store.loadEmployees();
  }
}
```

### Pattern 2: Feature-Scoped Store

For features that don't need global state:

```typescript
// Provided at component level — created and destroyed with the component
@Injectable()
export class ChecklistStore {
  private readonly _items = signal<ChecklistItem[]>([]);

  public readonly items = this._items.asReadonly();
  public readonly completedCount = computed(() => this._items().filter((i) => i.completed).length);
  public readonly totalCount = computed(() => this._items().length);
  public readonly progress = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  public toggle(id: string): void {
    this._items.update((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  }

  public add(title: string): void {
    this._items.update((prev) => [...prev, { id: crypto.randomUUID(), title, completed: false }]);
  }

  public remove(id: string): void {
    this._items.update((prev) => prev.filter((i) => i.id !== id));
  }
}

@Component({
  providers: [ChecklistStore], // Scoped to this component
  // ...
})
export class ChecklistComponent {
  public readonly store = inject(ChecklistStore);
}
```

### Pattern 3: resource() for Async Data

```typescript
@Component({...})
export class UserProfileComponent {
  public readonly userId = input.required<string>();

  private readonly _userResource = resource({
    params: () => this.userId(),
    loader: async ({ params: id, abortSignal }) => {
      const response = await fetch(`/api/users/${id}`, {
        signal: abortSignal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load user: ${response.statusText}`);
      }
      return response.json() as Promise<User>;
    },
  });

  // Clean public API from resource
  public readonly user = computed(() => this._userResource.value());
  public readonly isLoading = computed(() => this._userResource.isLoading());
  public readonly error = computed(() => this._userResource.error());

  public reload(): void {
    this._userResource.reload();
  }
}
```

`resource()` handles cancellation automatically. If `userId` changes while a request is in flight, the previous request gets aborted via `AbortSignal`.

## RxJS Interop: The Bridge

You don't have to rewrite everything. Use `toSignal()` and `toObservable()` to bridge the two worlds.

### toSignal() — Observable to Signal

```typescript
@Component({...})
export class LiveSearchComponent {
  private readonly _searchControl = new FormControl('');
  private readonly _http = inject(HttpClient);

  // RxJS handles the complex event stream
  private readonly _results$ = this._searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((query): query is string => query !== null && query.length >= 2),
    switchMap((query) =>
      this._http.get<SearchResult[]>(`/api/search?q=${query}`).pipe(
        catchError(() => of([] as SearchResult[])),
      )
    ),
  );

  // Convert to signal for template consumption
  public readonly results = toSignal(this._results$, { initialValue: [] });
  public readonly hasResults = computed(() => this.results().length > 0);
}
```

**Rule of thumb**: Use RxJS for complex async flows (debounce, switchMap, retry, race conditions). Use signals for state and template binding. Bridge with `toSignal()`.

### toObservable() — Signal to Observable

```typescript
private readonly _selectedCategory = signal<string>('all');

// When you need RxJS operators on a signal's changes
private readonly _categoryProducts$ = toObservable(this._selectedCategory).pipe(
  distinctUntilChanged(),
  switchMap((category) => this._http.get<Product[]>(`/api/products?cat=${category}`)),
);
```

## untracked() — Controlling Dependencies

Sometimes you need to read a signal inside a reactive context without creating a dependency.

```typescript
private readonly _items = signal<Item[]>([]);
private readonly _sortOrder = signal<'asc' | 'desc'>('asc');
private readonly _analytics = inject(AnalyticsService);

constructor() {
  // We want this effect to fire ONLY when items change,
  // not when sortOrder changes
  effect(() => {
    const items = this._items(); // Creates dependency
    const sort = untracked(() => this._sortOrder()); // No dependency

    this._analytics.track('items_updated', {
      count: items.length,
      currentSort: sort,
    });
  });
}
```

## Lifecycle Without Lifecycle Hooks

Signals + `DestroyRef` + `inject()` eliminate most lifecycle hooks:

| Old Way                   | New Way                               |
| ------------------------- | ------------------------------------- |
| `ngOnChanges`             | `computed()` from `input()` signals   |
| `ngOnInit` + subscription | `effect()` in constructor             |
| `ngAfterViewInit`         | `effect()` with `viewChild()`         |
| `ngOnDestroy`             | `DestroyRef` + `takeUntilDestroyed()` |

```typescript
// Before: 40+ lines
@Component({...})
export class OldComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() public userId!: string;
  @ViewChild('chart') private _chartRef!: ElementRef;

  public userName = '';
  private _subscription!: Subscription;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this._loadUser(this.userId);
    }
  }

  public ngOnInit(): void {
    this._subscription = this._someService.data$.subscribe(
      (data) => this._handleData(data)
    );
  }

  public ngAfterViewInit(): void {
    this._initChart(this._chartRef.nativeElement);
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // ...
}

// After: cleaner, fewer lines, fully reactive
@Component({...})
export class NewComponent {
  public readonly userId = input.required<string>();

  private readonly _chartRef = viewChild.required<ElementRef>('chart');
  private readonly _someService = inject(SomeService);
  private readonly _destroyRef = inject(DestroyRef);

  // Replaces ngOnChanges
  public readonly userName = computed(() => /* derive from userId */);

  constructor() {
    // Replaces ngOnChanges for side effects
    effect(() => {
      const id = this.userId();
      this._loadUser(id);
    });

    // Replaces ngOnInit + ngOnDestroy
    this._someService.data$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this._handleData(data));

    // Replaces ngAfterViewInit
    effect(() => {
      const el = this._chartRef();
      if (el) {
        this._initChart(el.nativeElement);
      }
    });
  }

  private _loadUser(id: string): void { /* ... */ }
  private _handleData(data: unknown): void { /* ... */ }
  private _initChart(el: HTMLElement): void { /* ... */ }
}
```

## Zoneless: The End Goal

Signals enable `provideZonelessChangeDetection()`. Without Zone.js:

- No monkey-patching of browser APIs
- Smaller bundle (Zone.js is ~13KB gzipped)
- More predictable change detection
- Better performance in large apps

The flow becomes:

```
signal.set() → mark consumers dirty → schedule single tick → update only dirty components
```

To prepare your app:

1. Use `OnPush` change detection everywhere
2. Replace `@Input()` / `@Output()` with `input()` / `output()`
3. Move state to signals, derive with `computed()`
4. Replace `ngOnChanges` with reactive patterns
5. Test with `provideZonelessChangeDetection()` — it's stable since Angular 19

## Practical Checklist

**Immediate wins:**

- [ ] Add `changeDetection: ChangeDetectionStrategy.OnPush` to every component
- [ ] Replace `@Input()` with `input()` / `input.required()`
- [ ] Replace `@Output() + EventEmitter` with `output()`
- [ ] Replace `@ViewChild` with `viewChild()`
- [ ] Use `computed()` instead of getters and `ngOnChanges`

**State management:**

- [ ] Create service stores with private `signal()` + public `.asReadonly()`
- [ ] Derive all secondary state with `computed()`
- [ ] Use `resource()` for async data that depends on reactive parameters
- [ ] Bridge RxJS with `toSignal()` where needed

**Avoid:**

- [ ] Never mutate signal values directly — always create new references
- [ ] Never use `effect()` to sync signals — use `computed()` or `linkedSignal()`
- [ ] Never call functions in templates — use `computed()` instead
- [ ] Never `track` by `$index` when items have unique IDs

## Closing Thoughts

Signals aren't just a new API surface. They're a shift from "detect everything, hope for the best" to "track exactly what changed, update only what's needed."

Start small. Pick one component, refactor its inputs to `input()`, replace `ngOnChanges` with `computed()`, and see how much cleaner it gets. Then move to a service store. Then try zoneless.

The framework is moving fast. The patterns here work today with Angular 19+ and will only get better.
