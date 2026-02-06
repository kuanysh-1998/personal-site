import { InterviewCategory } from '../../types/interview.types';

export const angularQuestionsEn: InterviewCategory = {
  id: 'angular',
  name: 'Angular',
  icon: 'angular',
  questions: [
    {
      id: 'ng-1',
      question: 'How does Change Detection work in Angular?',
      answer: `Change Detection (CD) synchronizes component state with DOM. Angular checks the component tree and updates views where data changed.

**Trigger mechanism:**
Zone.js monkey-patches async APIs (addEventListener, setTimeout, fetch, etc.). When any async operation completes, Zone.js notifies Angular → CD runs.

**Two strategies:**

1. **Default** — checks ALL components top-down on every async event. Simple but expensive.

2. **OnPush** — checks component only when:
   - @Input reference changed (not mutation!)
   - Event fired from THIS component or its children
   - Async pipe received new value
   - Manual trigger: markForCheck() or detectChanges()

**Key difference:**
- markForCheck() — marks component and ancestors as dirty, waits for next CD cycle
- detectChanges() — runs CD immediately for this component and children

**Best practice:** OnPush everywhere + immutable data.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// OnPush setup
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div *ngFor="let user of users()">{{ user.name }}</div>
  \`
})
export class UserListComponent {
  public users = input<User[]>([]);
}`,
        },
        {
          language: 'typescript',
          code: `// Common OnPush trap — mutation
// ❌ WRONG — mutation doesn't trigger CD with OnPush
this.items.push('new'); // Same reference — view won't update

// ✅ CORRECT — new reference
this.items = [...this.items, 'new'];

// ✅ OR manual trigger (last resort)
this.items.push('new');
this.cdr.markForCheck();`,
        },
        {
          language: 'typescript',
          code: `// NgZone.runOutsideAngular for performance
private _data!: Data;

constructor(private _ngZone: NgZone) {}

public startHeavyAnimation(): void {
  this._ngZone.runOutsideAngular(() => {
    requestAnimationFrame(function animate() {
      // ... animation logic — won't trigger CD
      requestAnimationFrame(animate);
    });
  });
}

public updateUI(data: Data): void {
  this._ngZone.run(() => {
    this._data = data; // This triggers CD
  });
}`,
        },
      ],
    },

    {
      id: 'ng-2',
      question: 'What are Signals and how do they change Angular?',
      answer: `Signals are Angular's reactive primitive (v16+). A signal wraps a value and notifies consumers when it changes.

**Why signals exist:**
- Zone.js overhead — patches everything, even when data hasn't changed
- RxJS complexity for simple state — subscriptions, memory leaks, boilerplate
- Future: zoneless Angular (signals enable fine-grained reactivity)

**Core API:**
- signal(value) — writable signal
- computed(() => ...) — derived value, auto-tracks dependencies, memoized
- effect(() => ...) — side effect when dependencies change

**Signal vs Observable:**
| Signal | Observable |
|--------|------------|
| Synchronous | Can be async |
| Always has value | Can be empty |
| Auto-tracked in templates | Needs async pipe |
| Simpler API | More operators |

**When to use what:**
- Signals: component state, UI state, simple derived values
- RxJS: HTTP, events, complex async flows, operators needed`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Basic signals
import { signal, computed, effect } from '@angular/core';

@Component({
  template: \`
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  \`
})
export class CounterComponent {
  public count = signal(0);
  public double = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log(\`Count: \${this.count()}\`);
    });
  }

  public increment(): void {
    this.count.update(v => v + 1);
  }
}`,
        },
        {
          language: 'typescript',
          code: `// Signal inputs (Angular 17+)
@Component({
  selector: 'app-user-card',
  template: \`<h2>{{ user().name }}</h2>\`
})
export class UserCardComponent {
  public user = input.required<User>();
  public showAvatar = input(true);
  
  public initials = computed(() => {
    const u = this.user();
    return u.firstName[0] + u.lastName[0];
  });
}`,
        },
        {
          language: 'typescript',
          code: `// linkedSignal (Angular 19+)
@Component({...})
export class ProductComponent {
  public products = input.required<Product[]>();
  
  // Resets to first product when products change
  public selectedProduct = linkedSignal(() => this.products()[0]);
  
  public selectProduct(p: Product): void {
    this.selectedProduct.set(p); // Writable!
  }
}`,
        },
        {
          language: 'typescript',
          code: `// resource() for async data (Angular 19+)
@Component({...})
export class UserProfileComponent {
  public userId = input.required<string>();
  
  public userResource = resource({
    request: () => this.userId(),
    loader: ({ request: id }) => this._userService.getUser(id),
  });
  
  private _userService = inject(UserService);
  
  // userResource.value() — the data
  // userResource.isLoading() — loading state
  // userResource.error() — error if any
}`,
        },
      ],
    },

    {
      id: 'ng-3',
      question: 'Explain Dependency Injection in Angular',
      answer: `DI is a pattern where dependencies are provided externally, not created inside a class. Angular has a hierarchical injector system.

**Why DI matters:**
- Testability — swap real service with mock
- Loose coupling — component doesn't know how service is created
- Flexibility — different instances for different scopes

**Injector hierarchy (top to bottom):**
1. Platform — shared across apps (rare)
2. Root — providedIn: 'root', singleton for entire app
3. Module — singleton within lazy-loaded module
4. Component — new instance per component

**Resolution:** Angular walks up the tree until it finds a provider. If not found → error.

**Modern approach:** Use inject() function instead of constructor injection.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Provider scopes
// Root — singleton for entire app
@Injectable({ providedIn: 'root' })
export class AuthService { }

// Component — new instance per component
@Component({
  providers: [FormStateService]
})
export class UserFormComponent {
  private _formState = inject(FormStateService);
}`,
        },
        {
          language: 'typescript',
          code: `// InjectionToken for config
export const API_CONFIG = new InjectionToken<ApiConfig>('api.config');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_CONFIG, useValue: { baseUrl: '/api', timeout: 5000 } }
  ]
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _config = inject(API_CONFIG);
  private _http = inject(HttpClient);
  
  public fetch(endpoint: string) {
    return this._http.get(\`\${this._config.baseUrl}/\${endpoint}\`);
  }
}`,
        },
        {
          language: 'typescript',
          code: `// Factory providers
{
  provide: Logger,
  useFactory: (env: Environment) => {
    return env.production ? new ProdLogger() : new DevLogger();
  },
  deps: [Environment]
}

// useExisting — alias
{ provide: AbstractStorage, useExisting: LocalStorageService }

// useClass — different implementation
{ provide: HttpClient, useClass: MockHttpClient }`,
        },
        {
          language: 'typescript',
          code: `// Functional interceptor (modern)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: \`Bearer \${token}\` }
    });
  }
  
  return next(req);
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))`,
        },
      ],
    },

    {
      id: 'ng-4',
      question: 'What are Standalone Components and why use them?',
      answer: `Standalone components are self-contained — they declare their own dependencies without NgModule.

**Benefits:**
- Less boilerplate — no module file for every component
- Clearer dependencies — imports right in the component
- Better tree-shaking — unused components easier to exclude
- Simpler mental model — component is the unit, not module

**Key changes:**
- standalone: true in @Component
- imports: [] for dependencies (other components, directives, pipes)
- No declarations array anywhere
- bootstrapApplication() instead of platformBrowserDynamic().bootstrapModule()

**Migration:** Angular provides schematics. Can be gradual — standalone and module-based components work together.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Standalone component
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UserAvatarComponent,
  ],
  template: \`
    <img [src]="user.avatar" />
    <h3>{{ user.name }}</h3>
    <a [routerLink]="['/users', user.id]">View</a>
  \`
})
export class UserCardComponent {
  public user = input.required<User>();
}`,
        },
        {
          language: 'typescript',
          code: `// Bootstrap standalone app
// main.ts
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
  ]
};`,
        },
        {
          language: 'typescript',
          code: `// Lazy loading standalone component
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  }
];`,
        },
      ],
    },

    {
      id: 'ng-5',
      question: 'Explain the new control flow syntax (@if, @for, @switch)',
      answer: `Angular 17+ introduced built-in control flow that replaces *ngIf, *ngFor, *ngSwitch.

**Why new syntax:**
- No imports needed — built into compiler
- Better performance — optimized at compile time
- Cleaner syntax — especially for if-else chains
- @empty block — handle empty collections elegantly

**Key differences:**
- @for REQUIRES track — no more forgetting trackBy
- @if has inline @else — no need for ng-template
- @switch is exhaustive — compiler can check all cases`,
      codeSnippets: [
        {
          language: 'html',
          code: `<!-- @if with @else -->
<!-- Old way -->
<div *ngIf="user; else loading">{{ user.name }}</div>
<ng-template #loading>Loading...</ng-template>

<!-- New way -->
@if (user) {
  <div>{{ user.name }}</div>
} @else if (error) {
  <div class="error">{{ error }}</div>
} @else {
  <div>Loading...</div>
}`,
        },
        {
          language: 'html',
          code: `<!-- @for with track (required!) -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <div>No items found</div>
}

<!-- Index and other locals -->
@for (item of items; track item.id; let i = $index, let first = $first) {
  <div [class.first]="first">{{ i + 1 }}. {{ item.name }}</div>
}`,
        },
        {
          language: 'html',
          code: `<!-- @switch -->
@switch (status) {
  @case ('pending') {
    <pending-badge />
  }
  @case ('approved') {
    <approved-badge />
  }
  @default {
    <unknown-badge />
  }
}`,
        },
      ],
    },

    {
      id: 'ng-6',
      question: 'What are @defer blocks and when to use them?',
      answer: `@defer enables lazy loading at the template level. Components inside @defer load only when trigger condition is met.

**Use cases:**
- Below-the-fold content — load when visible
- Heavy components — load on interaction
- Conditional features — load only if user needs them

**Triggers:**
- on viewport — when enters viewport (default)
- on idle — when browser is idle
- on interaction — click, focus, etc.
- on hover — mouse hover
- on timer(Xms) — after delay
- when condition — custom condition

**States:**
- @placeholder — shown initially (not lazy loaded)
- @loading — while loading chunk
- @error — if loading fails`,
      codeSnippets: [
        {
          language: 'html',
          code: `<!-- Basic defer with viewport trigger -->
@defer (on viewport) {
  <app-analytics-chart [data]="chartData" />
} @placeholder {
  <div class="chart-skeleton">Loading chart...</div>
} @loading (minimum 500ms) {
  <app-spinner />
} @error {
  <div>Failed to load chart</div>
}`,
        },
        {
          language: 'html',
          code: `<!-- Interaction trigger with prefetch -->
@defer (on interaction; prefetch on hover) {
  <app-heavy-modal [config]="modalConfig" />
} @placeholder {
  <button>Open Settings</button>
}

<!-- Timer trigger -->
@defer (on timer(2000)) {
  <app-recommendations />
}`,
        },
        {
          language: 'html',
          code: `<!-- Conditional defer -->
@defer (when hasAdminAccess) {
  <app-admin-panel />
}

<!-- Combine triggers -->
@defer (on viewport; on timer(5000)) {
  <app-footer-widgets />
}`,
        },
      ],
    },

    {
      id: 'ng-7',
      question: 'switchMap vs mergeMap vs concatMap vs exhaustMap',
      answer: `These operators flatten inner observables but differ in how they handle concurrent emissions.

| Operator | Behavior | Use Case |
|----------|----------|----------|
| switchMap | Cancels previous, uses latest | Search, autocomplete |
| mergeMap | Runs all in parallel | Batch operations |
| concatMap | Queues, runs sequentially | Order-dependent ops |
| exhaustMap | Ignores new while busy | Form submit, login |

**Memory rule:** Always unsubscribe or use takeUntil/takeUntilDestroyed.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// switchMap — search (cancels previous)
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.searchService.search(query))
).subscribe(results => this.results = results);`,
        },
        {
          language: 'typescript',
          code: `// exhaustMap — form submit (ignore while busy)
submitClicks$.pipe(
  exhaustMap(() => this.orderService.submit(this.form.value))
).subscribe({
  next: () => this.router.navigate(['/success']),
  error: (e) => this.showError(e)
});`,
        },
        {
          language: 'typescript',
          code: `// concatMap — order-dependent operations
files$.pipe(
  concatMap(file => this.uploadService.upload(file))
).subscribe(result => this.uploadedFiles.push(result));`,
        },
        {
          language: 'typescript',
          code: `// Memory leak prevention
// Option 1: takeUntilDestroyed (Angular 16+)
private _userService = inject(UserService);
public user$ = this._userService.getUser().pipe(
  takeUntilDestroyed()
);

// Option 2: async pipe
@Component({
  template: \`@if (user$ | async; as user) { {{ user.name }} }\`
})

// Option 3: DestroyRef
private _destroyRef = inject(DestroyRef);
private _userService = inject(UserService);

public ngOnInit(): void {
  this._userService.getUser().pipe(
    takeUntilDestroyed(this._destroyRef)
  ).subscribe();
}`,
        },
      ],
    },

    {
      id: 'ng-8',
      question: 'Explain Angular Router guards and resolvers',
      answer: `Guards control navigation, resolvers pre-fetch data.

**Guards (return boolean/UrlTree/Observable):**
- canActivate — can navigate TO route?
- canDeactivate — can leave route? (unsaved changes)
- canMatch — can route even match? (feature flags)
- canActivateChild — for all children

**Resolvers:** Fetch data BEFORE route activates. Component gets data immediately.

**Modern approach:** Use functional guards/resolvers with inject().`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Functional auth guard
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// routes
{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }`,
        },
        {
          language: 'typescript',
          code: `// canDeactivate — unsaved changes
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = 
  (component) => {
    if (component.canDeactivate()) return true;
    return confirm('You have unsaved changes. Leave anyway?');
  };`,
        },
        {
          language: 'typescript',
          code: `// Functional resolver
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  const id = route.paramMap.get('id')!;
  return userService.getUser(id);
};

// routes
{ path: 'users/:id', component: UserDetailComponent, resolve: { user: userResolver } }

// component
user = toSignal(this.route.data.pipe(map(d => d['user'])));`,
        },
      ],
    },

    {
      id: 'ng-9',
      question: 'Template-driven vs Reactive forms — when to use which?',
      answer: `**Template-driven:** Logic in template, simpler, good for basic forms.
**Reactive:** Logic in TypeScript, testable, good for complex/dynamic forms.

| Aspect | Template-driven | Reactive |
|--------|-----------------|----------|
| Setup | FormsModule, ngModel | ReactiveFormsModule, FormGroup |
| Validation | Directives | Functions |
| Testing | Harder (needs DOM) | Easier (pure functions) |
| Dynamic | Limited | Full control |

**Rule of thumb:** Login form → template-driven. Multi-step wizard → reactive.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Reactive form with validation
@Component({...})
export class UserFormComponent {
  private _fb = inject(FormBuilder);
  
  public form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: [''],
  }, {
    validators: this._passwordMatchValidator
  });
  
  private _passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
}`,
        },
        {
          language: 'typescript',
          code: `// Custom async validator
export function uniqueUsernameValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    
    return userService.checkUsername(control.value).pipe(
      map(isTaken => isTaken ? { usernameTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// Usage — async validators = 3rd param
this._fb.group({
  username: ['', [Validators.required], [uniqueUsernameValidator(this._userService)]]
});`,
        },
        {
          language: 'typescript',
          code: `// FormArray for dynamic fields
private _fb = inject(FormBuilder);

public form = this._fb.group({
  name: [''],
  phones: this._fb.array([])
});

public get phones(): FormArray {
  return this.form.get('phones') as FormArray;
}

public addPhone(): void {
  this.phones.push(this._fb.group({
    type: ['mobile'],
    number: ['', Validators.required]
  }));
}

public removePhone(index: number): void {
  this.phones.removeAt(index);
}`,
        },
      ],
    },

    {
      id: 'ng-10',
      question: 'How do you optimize Angular app performance?',
      answer: `Performance optimization covers build time, bundle size, and runtime.

**Bundle size:**
- Lazy load routes and components (@defer)
- Tree-shake unused code (standalone helps)
- Analyze bundle: source-map-explorer
- Import specific modules, not entire libraries

**Runtime:**
- OnPush change detection everywhere
- trackBy / track in @for — avoid DOM recreation
- Virtual scrolling for long lists
- Memoize expensive computations (computed signals)
- runOutsideAngular for non-UI operations

**Loading:**
- SSR + hydration for FCP
- Preload critical routes
- Use @defer with prefetch`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Virtual scrolling for long lists
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [ScrollingModule],
  template: \`
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items">{{ item.name }}</div>
    </cdk-virtual-scroll-viewport>
  \`,
  styles: [\`.viewport { height: 400px; }\`]
})
export class LongListComponent {
  public items = signal<Item[]>([]);
}`,
        },
        {
          language: 'typescript',
          code: `// Route preloading strategy
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
};`,
        },
        {
          language: 'bash',
          code: `# Bundle analysis
ng build --stats-json
npx source-map-explorer dist/app/browser/*.js`,
        },
      ],
    },
  ],
};
