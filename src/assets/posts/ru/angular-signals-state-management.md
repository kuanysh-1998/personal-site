Сигналы изменили подход Angular к реактивности. Больше никаких угадываний Zone.js, никаких глобальных проверок дерева компонентов. Но большинство туториалов останавливаются на базовых `signal()`, `computed()` и `effect()`. Этот пост идёт дальше — в практические паттерны управления состоянием, реальную архитектуру компонентов и ментальные сдвиги, которые действительно важны для продакшн-приложений.

## Зачем нужны сигналы

Старая модель реактивности Angular имела фундаментальный недостаток: **Zone.js не знает, что изменилось**. Он патчит каждый асинхронный API (`setTimeout`, `Promise`, `fetch`, обработчики событий) и говорит Angular: «что-то произошло, проверяй всё». Angular после этого обходит всё дерево компонентов сверху вниз, сравнивая старые и новые значения.

Это работает. Но расточительно. В дашборде с 200+ компонентами один клик по кнопке запускает проверки компонентов, которые не менялись.

Сигналы решают это, делая реактивность **явной и гранулярной**. Когда сигнал меняется, Angular точно знает, какие computed-значения от него зависят, какие эффекты нужно перезапустить и какие привязки в шаблоне обновить. Никаких догадок. Никакой лишней работы.

Реактивный граф выглядит так:

```
signal(источник) → computed(производное) → effect(побочный эффект)
       ↓                    ↓
    шаблон               шаблон
```

Каждый `signal()` — это **продюсер**. Каждый `computed()` — одновременно **консьюмер** и **продюсер**. Каждый `effect()` — чистый **консьюмер**. Зависимости отслеживаются автоматически при чтении сигнала внутри реактивного контекста.

## Три примитива как надо

### signal() — Изменяемое состояние

```typescript
// Примитивные значения
private readonly _count = signal(0);
private readonly _userName = signal('');

// Объекты — всегда обновляем иммутабельно
private readonly _user = signal<User | null>(null);

// ✅ Правильно: иммутабельное обновление
public updateName(name: string): void {
  this._user.update((prev) => prev ? { ...prev, name } : null);
}

// ❌ Неправильно: мутация не вызовет реактивность
public updateNameBroken(name: string): void {
  const user = this._user();
  if (user) {
    user.name = name; // Сигнал не узнает об этом
  }
}
```

**Ключевое правило**: Сигналы по умолчанию используют ссылочное равенство (`Object.is`). Мутация свойства объекта не меняет ссылку, поэтому сигнал не уведомит консьюмеров. Всегда создавайте новый объект через spread или конструктор.

Для сложных случаев можно переопределить проверку равенства:

```typescript
private readonly _config = signal<AppConfig>(defaultConfig, {
  equal: (a, b) => a.version === b.version,
});
```

### computed() — Производное состояние

`computed()` ленивый и мемоизированный. Он не пересчитается, пока его не прочитают, и не пересчитается, если зависимости не изменились.

```typescript
private readonly _employees = signal<Employee[]>([]);
private readonly _searchQuery = signal('');
private readonly _selectedDepartment = signal<string | null>(null);

// Производное: отфильтрованный список на основе двух сигналов
public readonly filteredEmployees = computed(() => {
  const query = this._searchQuery().toLowerCase();
  const dept = this._selectedDepartment();

  return this._employees().filter((emp) => {
    const matchesQuery = emp.name.toLowerCase().includes(query);
    const matchesDept = !dept || emp.department === dept;
    return matchesQuery && matchesDept;
  });
});

// Производное от производного — цепочки строятся автоматически
public readonly filteredCount = computed(() => this.filteredEmployees().length);
public readonly hasResults = computed(() => this.filteredCount() > 0);
```

**Антипаттерн**: Не используйте `computed()` для побочных эффектов. Он только для чистых трансформаций.

```typescript
// ❌ Никогда так не делайте
const bad = computed(() => {
  const data = this._items();
  localStorage.setItem('items', JSON.stringify(data)); // Побочный эффект!
  return data.length;
});
```

### effect() — Побочные эффекты (используйте осторожно)

Эффекты — это лазейка для императивных операций. Они должны быть последним средством, а не первым инструментом.

```typescript
@Component({...})
export class SearchComponent {
  private readonly _searchQuery = signal('');

  constructor() {
    // Синхронизация с localStorage
    effect(() => {
      const query = this._searchQuery();
      localStorage.setItem('lastSearch', query);
    });

    // С очисткой
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

**Когда использовать effect():**

- Синхронизация с `localStorage` / `sessionStorage`
- Логирование и аналитика
- Интеграция со сторонними нереактивными библиотеками
- Ручная манипуляция DOM (редко в Angular)

**Когда НЕ использовать effect():**

- Получение производного состояния → используйте `computed()`
- Обновление одного сигнала на основе другого → используйте `computed()` или `linkedSignal()`

```typescript
// ❌ Антипаттерн: effect как синхронизатор состояния
private readonly _firstName = signal('');
private readonly _lastName = signal('');
private readonly _fullName = signal('');

constructor() {
  effect(() => {
    this._fullName.set(`${this._firstName()} ${this._lastName()}`);
  });
}

// ✅ Правильно: computed для производного состояния
public readonly fullName = computed(
  () => `${this._firstName()} ${this._lastName()}`
);
```

## Сигнальные API компонентов

### input() заменяет @Input()

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
  // Обязательный инпут — Angular выбросит ошибку, если родитель не передаст
  public readonly employee = input.required<Employee>();

  // Опциональный с дефолтом
  public readonly showActions = input(true);

  // С трансформацией
  public readonly highlighted = input(false, { transform: booleanAttribute });

  // Производное от инпута — полностью заменяет ngOnChanges
  public readonly isManager = computed(() => this.employee().role === 'manager');

  // Output
  public readonly deleted = output<string>();

  public onDelete(): void {
    this.deleted.emit(this.employee().id);
  }
}
```

**Главный выигрыш**: Больше никакого `ngOnChanges`. Каждый инпут — это сигнал. Любое производное значение — через `computed()`.

### model() — Двусторонняя привязка как полноценный примитив

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
  // model() = input + output в одном
  // Родитель использует: [(value)]="searchQuery"
  public readonly value = model('');
  public readonly placeholder = input('Search...');
}
```

Вызов `value.set('...')` внутри делает две вещи: обновляет сигнал И отправляет изменение родителю. Никакого ручного `@Output() valueChange` бойлерплейта.

### viewChild() — Реактивные запросы к DOM

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
    // Полностью заменяет ngAfterViewInit
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
    // Инициализация сторонней библиотеки графиков
  }
}
```

## Паттерны управления состоянием

Здесь сигналы по-настоящему раскрываются. Для малых и средних приложений (и даже многих энтерпрайз) не нужны NgRx, NGXS или любая внешняя библиотека стейт-менеджмента.

### Паттерн 1: Сервис как стор

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  // Приватное записываемое состояние
  private readonly _employees = signal<Employee[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedId = signal<string | null>(null);

  private readonly _http = inject(HttpClient);
  private readonly _destroyRef = inject(DestroyRef);

  // Публичные read-only сигналы
  public readonly employees = this._employees.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  // Производное состояние
  public readonly selectedEmployee = computed(() => {
    const id = this._selectedId();
    return id ? (this._employees().find((e) => e.id === id) ?? null) : null;
  });

  public readonly employeeCount = computed(() => this._employees().length);

  public readonly departments = computed(() => {
    const unique = new Set(this._employees().map((e) => e.department));
    return [...unique].sort();
  });

  // Действия
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

    // Сбрасываем выделение, если удалённый сотрудник был выбран
    if (this._selectedId() === id) {
      this._selectedId.set(null);
    }
  }

  public updateEmployee(id: string, changes: Partial<Employee>): void {
    this._employees.update((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }
}
```

Использование в компоненте:

```typescript
@Component({
  template: `
    @if (store.loading()) {
      <app-spinner />
    } @else if (store.error(); as error) {
      <app-error [message]="error" />
    } @else {
      <p>{{ store.employeeCount() }} сотрудников</p>
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

### Паттерн 2: Стор на уровне фичи

Для состояния, которому не нужна глобальная область видимости:

```typescript
// Провайдится на уровне компонента — создаётся и уничтожается вместе с ним
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
  providers: [ChecklistStore], // Область видимости — этот компонент
  // ...
})
export class ChecklistComponent {
  public readonly store = inject(ChecklistStore);
}
```

### Паттерн 3: resource() для асинхронных данных

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
        throw new Error(`Не удалось загрузить пользователя: ${response.statusText}`);
      }
      return response.json() as Promise<User>;
    },
  });

  // Чистый публичный API из resource
  public readonly user = computed(() => this._userResource.value());
  public readonly isLoading = computed(() => this._userResource.isLoading());
  public readonly error = computed(() => this._userResource.error());

  public reload(): void {
    this._userResource.reload();
  }
}
```

`resource()` автоматически обрабатывает отмену. Если `userId` изменится, пока запрос ещё в процессе, предыдущий запрос будет отменён через `AbortSignal`.

## RxJS Interop: Мост между мирами

Не нужно переписывать всё. Используйте `toSignal()` и `toObservable()` для связи двух миров.

### toSignal() — Observable в Signal

```typescript
@Component({...})
export class LiveSearchComponent {
  private readonly _searchControl = new FormControl('');
  private readonly _http = inject(HttpClient);

  // RxJS обрабатывает сложный поток событий
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

  // Конвертируем в сигнал для использования в шаблоне
  public readonly results = toSignal(this._results$, { initialValue: [] });
  public readonly hasResults = computed(() => this.results().length > 0);
}
```

**Правило**: RxJS — для сложных асинхронных потоков (debounce, switchMap, retry, гонки запросов). Сигналы — для состояния и привязок в шаблоне. Мост — `toSignal()`.

### toObservable() — Signal в Observable

```typescript
private readonly _selectedCategory = signal<string>('all');

// Когда нужны RxJS-операторы над изменениями сигнала
private readonly _categoryProducts$ = toObservable(this._selectedCategory).pipe(
  distinctUntilChanged(),
  switchMap((category) => this._http.get<Product[]>(`/api/products?cat=${category}`)),
);
```

## untracked() — Контроль зависимостей

Иногда нужно прочитать сигнал внутри реактивного контекста, не создавая зависимость.

```typescript
private readonly _items = signal<Item[]>([]);
private readonly _sortOrder = signal<'asc' | 'desc'>('asc');
private readonly _analytics = inject(AnalyticsService);

constructor() {
  // Мы хотим, чтобы этот эффект срабатывал ТОЛЬКО при изменении items,
  // а не при изменении sortOrder
  effect(() => {
    const items = this._items(); // Создаёт зависимость
    const sort = untracked(() => this._sortOrder()); // Без зависимости

    this._analytics.track('items_updated', {
      count: items.length,
      currentSort: sort,
    });
  });
}
```

## Жизненный цикл без хуков жизненного цикла

Сигналы + `DestroyRef` + `inject()` устраняют большинство хуков:

| Старый способ         | Новый способ                          |
| --------------------- | ------------------------------------- |
| `ngOnChanges`         | `computed()` от `input()`-сигналов    |
| `ngOnInit` + подписка | `effect()` в конструкторе             |
| `ngAfterViewInit`     | `effect()` с `viewChild()`            |
| `ngOnDestroy`         | `DestroyRef` + `takeUntilDestroyed()` |

```typescript
// До: 40+ строк
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

// После: чище, меньше строк, полностью реактивный
@Component({...})
export class NewComponent {
  public readonly userId = input.required<string>();

  private readonly _chartRef = viewChild.required<ElementRef>('chart');
  private readonly _someService = inject(SomeService);
  private readonly _destroyRef = inject(DestroyRef);

  // Заменяет ngOnChanges
  public readonly userName = computed(() => /* производное от userId */);

  constructor() {
    // Заменяет ngOnChanges для побочных эффектов
    effect(() => {
      const id = this.userId();
      this._loadUser(id);
    });

    // Заменяет ngOnInit + ngOnDestroy
    this._someService.data$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this._handleData(data));

    // Заменяет ngAfterViewInit
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

## Zoneless: Конечная цель

Сигналы открывают путь к `provideZonelessChangeDetection()`. Без Zone.js:

- Нет monkey-patching браузерных API
- Меньший бандл (Zone.js — ~13KB в gzip)
- Более предсказуемое обнаружение изменений
- Лучшая производительность в крупных приложениях

Поток становится таким:

```
signal.set() → пометить консьюмеров грязными → запланировать один tick → обновить только грязные компоненты
```

Чтобы подготовить приложение:

1. Используйте `OnPush` change detection везде
2. Замените `@Input()` / `@Output()` на `input()` / `output()`
3. Перенесите состояние в сигналы, выводите через `computed()`
4. Замените `ngOnChanges` на реактивные паттерны
5. Протестируйте с `provideZonelessChangeDetection()` — стабильно с Angular 19

## Практический чеклист

**Быстрые победы:**

- [ ] Добавьте `changeDetection: ChangeDetectionStrategy.OnPush` в каждый компонент
- [ ] Замените `@Input()` на `input()` / `input.required()`
- [ ] Замените `@Output() + EventEmitter` на `output()`
- [ ] Замените `@ViewChild` на `viewChild()`
- [ ] Используйте `computed()` вместо геттеров и `ngOnChanges`

**Управление состоянием:**

- [ ] Создавайте сервисы-сторы с приватными `signal()` + публичными `.asReadonly()`
- [ ] Выводите всё вторичное состояние через `computed()`
- [ ] Используйте `resource()` для асинхронных данных, зависящих от реактивных параметров
- [ ] Связывайте RxJS через `toSignal()` где нужно

**Избегайте:**

- [ ] Никогда не мутируйте значения сигналов напрямую — всегда создавайте новые ссылки
- [ ] Никогда не используйте `effect()` для синхронизации сигналов — используйте `computed()` или `linkedSignal()`
- [ ] Никогда не вызывайте функции в шаблонах — используйте `computed()`
- [ ] Никогда не делайте `track` по `$index`, когда у элементов есть уникальные ID

## Заключение

Сигналы — это не просто новая поверхность API. Это сдвиг от «проверяй всё, надейся на лучшее» к «отслеживай точно, что изменилось, обновляй только то, что нужно».

Начните с малого. Возьмите один компонент, переведите его инпуты на `input()`, замените `ngOnChanges` на `computed()` и посмотрите, насколько чище станет код. Потом перейдите к сервису-стору. Потом попробуйте zoneless.

Фреймворк движется быстро. Паттерны из этого поста работают уже сейчас с Angular 19+ и будут только улучшаться.
