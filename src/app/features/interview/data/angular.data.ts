import { InterviewQuestion } from '../types/interview.types';

export const angularQuestions: InterviewQuestion[] = [
  {
    id: 'ng-1',
    question: 'How does Change Detection work?',
    answer: `Change Detection is the mechanism that synchronizes component state with the DOM. When data changes, Angular updates the view.

**When it runs:**
- Browser events (click, input, scroll)
- HTTP responses
- Timers (setTimeout, setInterval)
- Promises and Observables

**Two strategies:**

1. **Default** — checks ALL components top-down on every event. Simple, but can be slow.

2. **OnPush** — checks component only if:
   - @Input changed (by reference)
   - Event originated inside the component
   - markForCheck() or detectChanges() called manually
   - async pipe triggered

**Recommendation:** Use OnPush everywhere + immutable data. This is the standard in production apps.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Default — always checked (slower)
@Component({
  selector: 'app-user-list',
  template: \`<div *ngFor="let user of users">{{ user.name }}</div>\`
})
export class UserListComponent {
  users: User[] = [];
}

// OnPush — checked only when @Input reference changes
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush, // ← key line
  template: \`<div *ngFor="let user of users">{{ user.name }}</div>\`
})
export class UserListComponent {
  @Input() users: User[] = [];
}`,
      },
      {
        language: 'typescript',
        code: `// OnPush trap: mutation doesn't trigger update
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`{{ items.length }} items\`
})
export class ListComponent {
  @Input() items: string[] = [];
}

// Parent component
this.items.push('new'); // WON'T update view — same reference

// Correct — new array
this.items = [...this.items, 'new']; // Will update view

// Or inside the component — manual trigger
constructor(private cdr: ChangeDetectorRef) {}

addItem() {
  this.items.push('new');
  this.cdr.markForCheck(); // Force check
}`,
      },
    ],
  },
  {
    id: 'ng-2',
    question: 'What are Signals and why do we need them?',
    answer: `Signals are Angular's new reactive primitive (since v16). It's a wrapper around a value that notifies Angular of changes.

**Problem they solve:**
- Zone.js intercepts EVERYTHING — even when data hasn't changed
- RxJS is overkill for simple component state
- Boilerplate with subscriptions and unsubscriptions

**How they work:**
- signal() — creates a reactive value
- computed() — derived value (like a getter, but cached)
- effect() — side-effect when signal changes

**Key difference from RxJS:** Signals are synchronous and always have a value. Observable can be empty and asynchronous.`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `import { signal, computed, effect } from '@angular/core';

@Component({
  template: \`
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  \`
})
export class CounterComponent {
  // signal — reactive value
  count = signal(0);
  
  // computed — automatically recalculates when count changes
  double = computed(() => this.count() * 2);
  
  constructor() {
    // effect — runs when dependencies change
    effect(() => {
      console.log(\`Count changed to: \${this.count()}\`);
    });
  }
  
  increment() {
    // Three ways to update a signal:
    this.count.set(10);            // Set value
    this.count.update(v => v + 1); // Based on previous
    // this.count() = 10;           // Can't! Read-only
  }
}`,
      },
      {
        language: 'typescript',
        code: `// Comparison: RxJS vs Signals for component state

// RxJS — lots of boilerplate
@Component({...})
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user$ = new BehaviorSubject<User | null>(null);
  
  ngOnInit() {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.user$.next(user));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Signals — simpler
@Component({...})
export class UserComponent {
  user = signal<User | null>(null);
  
  constructor() {
    this.userService.getUser()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user));
  }
  // No ngOnDestroy — takeUntilDestroyed handles it
}`,
      },
    ],
  },
  {
    id: 'ng-3',
    question: 'How does Dependency Injection work in Angular?',
    answer: `Dependency Injection (DI) is a pattern where dependencies are passed from outside rather than created inside a class. Angular has a built-in DI system with a hierarchy of injectors.

**Why it matters:**
- Testability — easy to swap dependency with a mock
- Loose coupling — component doesn't know how to create service
- Reusability — one service for the entire app (or per module)

**Injector hierarchy:**
1. Root (providedIn: 'root') — singleton for entire app
2. Module — singleton within module scope
3. Component — new instance for each component

**Injection methods:**
- Constructor injection (classic)
- inject() function (modern, works everywhere)`,
    codeSnippets: [
      {
        language: 'typescript',
        code: `// Service — singleton for entire app
@Injectable({ providedIn: 'root' })
export class UserService {
  private users = signal<User[]>([]);
  
  getUsers() { return this.users(); }
}

// Two ways to inject
@Component({...})
export class UserListComponent {
  // 1. Constructor injection — classic
  constructor(private userService: UserService) {}
  
  // 2. inject() — modern approach
  private userService = inject(UserService);
  
  // inject() works in field initializers, constructor, factory functions
  // Constructor injection — only in constructor
}`,
      },
      {
        language: 'typescript',
        code: `// Hierarchy: different instances for different scopes

// Root level — one for entire app
@Injectable({ providedIn: 'root' })
export class GlobalStateService { }

// Component level — new instance for each component
@Component({
  providers: [LocalStateService] // ← Each UserCard gets its own instance
})
export class UserCardComponent {
  private state = inject(LocalStateService);
}

// Practical example: FormService for each form
@Component({
  selector: 'app-user-form',
  providers: [FormValidationService] // Isolated for this form
})
export class UserFormComponent {
  private validation = inject(FormValidationService);
  // Other UserFormComponent instances get their own instances
}`,
      },
    ],
  },
];
