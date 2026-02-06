import { InterviewCategory } from '../../types/interview.types';

export const angularQuestionsRu: InterviewCategory = {
  id: 'angular',
  name: 'Angular',
  icon: 'angular',
  questions: [
    {
      id: 'ng-1',
      question: 'Как работает Change Detection в Angular?',
      answer: `Change Detection (CD) — это механизм, который держит DOM в синхронизации с данными компонентов. Когда данные меняются, Angular проходит по дереву компонентов и перерисовывает те части, которые нужно обновить.
    
    **Как запускается:**
    Angular использует библиотеку Zone.js, которая оборачивает все асинхронные API (обработчики кликов, setTimeout, HTTP-запросы и т.д.). Когда любая асинхронная операция завершается, Zone.js говорит Angular: «что-то могло измениться» → Angular запускает CD по всему дереву компонентов.
    
    **Две стратегии:**
    
    1. **Default** — при каждом асинхронном событии Angular проверяет ВСЕ компоненты сверху вниз. Просто в использовании, но дорого: даже компоненты с неизменёнными данными проверяются.
    
    2. **OnPush** — Angular пропускает компонент, если не произошло одно из четырёх:
       - В @Input пришла новая ссылка на объект (мутация существующего объекта не сработает!)
       - DOM-событие произошло в этом компоненте или его дочерних (click, input и т.д.)
       - async pipe получил новое значение
       - Ты вручную вызвал markForCheck() или detectChanges()
    
    **markForCheck() vs detectChanges():**
    - markForCheck() — помечает компонент и всех его предков как «грязные». Они будут проверены в следующем цикле CD (не запускается сразу).
    - detectChanges() — запускает CD прямо сейчас, но только для этого компонента и его потомков. Полезно, когда нужно мгновенное обновление UI.
    
    **Лучшая практика:** Ставь OnPush на каждый компонент + работай с данными иммутабельно (всегда создавай новые ссылки вместо мутации).`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Настройка OnPush
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
          code: `// Типичная ловушка OnPush — мутация
    // ❌ НЕПРАВИЛЬНО — мутация не запустит CD с OnPush
    this.items.push('new'); // Та же ссылка — view не обновится
    
    // ✅ ПРАВИЛЬНО — новая ссылка
    this.items = [...this.items, 'new'];
    
    // ✅ ИЛИ ручной вызов (крайний случай)
    this.items.push('new');
    this.cdr.markForCheck();`,
        },
        {
          language: 'typescript',
          code: `// NgZone.runOutsideAngular для производительности
    private _data!: Data;
    
    constructor(private _ngZone: NgZone) {}
    
    public startHeavyAnimation(): void {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(function animate() {
          // ... логика анимации — не запустит CD
          requestAnimationFrame(animate);
        });
      });
    }
    
    public updateUI(data: Data): void {
      this._ngZone.run(() => {
        this._data = data; // Это запустит CD
      });
    }`,
        },
      ],
    },

    {
      id: 'ng-2',
      question: 'Что такое Signals и как они меняют Angular?',
      answer: `Signals — реактивный примитив Angular (v16+). Signal оборачивает значение и уведомляет потребителей при его изменении.

**Зачем нужны Signals:**
- Накладные расходы Zone.js — перехватывает всё, даже когда данные не изменились
- Сложность RxJS для простого состояния — подписки, утечки памяти, бойлерплейт
- Будущее: Angular без Zone.js (Signals обеспечивают точечную реактивность)

**Основной API:**
- signal(value) — записываемый сигнал
- computed(() => ...) — вычисляемое значение, автоотслеживание зависимостей, мемоизация
- effect(() => ...) — побочный эффект при изменении зависимостей

**Signal vs Observable:**
| Signal | Observable |
|--------|------------|
| Синхронный | Может быть асинхронным |
| Всегда имеет значение | Может быть пустым |
| Автотрекинг в шаблонах | Нужен async pipe |
| Простой API | Больше операторов |

**Когда что использовать:**
- Signals: состояние компонента, UI-состояние, простые вычисляемые значения
- RxJS: HTTP, события, сложные асинхронные потоки, нужны операторы`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Базовые сигналы
import { signal, computed, effect } from '@angular/core';

@Component({
  template: \`
    <p>Счётчик: {{ count() }}</p>
    <p>Удвоенное: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  \`
})
export class CounterComponent {
  public count = signal(0);
  public double = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log(\`Счётчик: \${this.count()}\`);
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
  
  // Сбрасывается на первый продукт при изменении products
  public selectedProduct = linkedSignal(() => this.products()[0]);
  
  public selectProduct(p: Product): void {
    this.selectedProduct.set(p); // Записываемый!
  }
}`,
        },
        {
          language: 'typescript',
          code: `// resource() для асинхронных данных (Angular 19+)
@Component({...})
export class UserProfileComponent {
  public userId = input.required<string>();
  
  public userResource = resource({
    request: () => this.userId(),
    loader: ({ request: id }) => this._userService.getUser(id),
  });
  
  private _userService = inject(UserService);
  
  // userResource.value() — данные
  // userResource.isLoading() — состояние загрузки
  // userResource.error() — ошибка, если есть
}`,
        },
      ],
    },

    {
      id: 'ng-3',
      question: 'Объясни Dependency Injection в Angular',
      answer: `DI — паттерн, при котором зависимости предоставляются извне, а не создаются внутри класса. Angular имеет иерархическую систему инжекторов.

**Почему DI важен:**
- Тестируемость — подменяем реальный сервис моком
- Слабая связанность — компонент не знает, как создан сервис
- Гибкость — разные инстансы для разных областей видимости

**Иерархия инжекторов (сверху вниз):**
1. Platform — общий для нескольких приложений (редко)
2. Root — providedIn: 'root', синглтон для всего приложения
3. Module — синглтон внутри лениво загруженного модуля
4. Component — новый инстанс для каждого компонента

**Разрешение:** Angular идёт вверх по дереву, пока не найдёт провайдер. Если не нашёл → ошибка.

**Современный подход:** Используй функцию inject() вместо constructor injection.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Области видимости провайдеров
// Root — синглтон для всего приложения
@Injectable({ providedIn: 'root' })
export class AuthService { }

// Component — новый инстанс для каждого компонента
@Component({
  providers: [FormStateService]
})
export class UserFormComponent {
  private _formState = inject(FormStateService);
}`,
        },
        {
          language: 'typescript',
          code: `// InjectionToken для конфигурации
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
          code: `// Фабричные провайдеры
{
  provide: Logger,
  useFactory: (env: Environment) => {
    return env.production ? new ProdLogger() : new DevLogger();
  },
  deps: [Environment]
}

// useExisting — алиас
{ provide: AbstractStorage, useExisting: LocalStorageService }

// useClass — другая реализация
{ provide: HttpClient, useClass: MockHttpClient }`,
        },
        {
          language: 'typescript',
          code: `// Функциональный интерсептор (современный подход)
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
      question: 'Что такое Standalone Components и зачем они нужны?',
      answer: `Standalone-компоненты самодостаточны — они объявляют свои зависимости без NgModule.

**Преимущества:**
- Меньше бойлерплейта — не нужен файл модуля для каждого компонента
- Явные зависимости — импорты прямо в компоненте
- Лучший tree-shaking — неиспользуемые компоненты проще исключить
- Проще ментальная модель — единица — компонент, а не модуль

**Ключевые изменения:**
- standalone: true в @Component
- imports: [] для зависимостей (другие компоненты, директивы, пайпы)
- Нет массива declarations нигде
- bootstrapApplication() вместо platformBrowserDynamic().bootstrapModule()

**Миграция:** Angular предоставляет схематики. Можно мигрировать постепенно — standalone и модульные компоненты работают вместе.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Standalone-компонент
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
          code: `// Загрузка standalone-приложения
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
          code: `// Ленивая загрузка standalone-компонента
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
      question: 'Объясни новый синтаксис control flow (@if, @for, @switch)',
      answer: `Angular 17+ представил встроенный control flow, заменяющий *ngIf, *ngFor, *ngSwitch.

**Почему новый синтаксис:**
- Не нужны импорты — встроен в компилятор
- Лучшая производительность — оптимизируется на этапе компиляции
- Чище синтаксис — особенно для цепочек if-else
- Блок @empty — элегантная обработка пустых коллекций

**Ключевые отличия:**
- @for ТРЕБУЕТ track — невозможно забыть trackBy
- @if поддерживает инлайн @else — не нужен ng-template
- @switch исчерпывающий — компилятор может проверить все случаи`,
      codeSnippets: [
        {
          language: 'html',
          code: `<!-- @if с @else -->
<!-- Старый способ -->
<div *ngIf="user; else loading">{{ user.name }}</div>
<ng-template #loading>Загрузка...</ng-template>

<!-- Новый способ -->
@if (user) {
  <div>{{ user.name }}</div>
} @else if (error) {
  <div class="error">{{ error }}</div>
} @else {
  <div>Загрузка...</div>
}`,
        },
        {
          language: 'html',
          code: `<!-- @for с track (обязательно!) -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <div>Элементы не найдены</div>
}

<!-- Индекс и другие локальные переменные -->
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
      question: 'Что такое @defer блоки и когда их использовать?',
      answer: `@defer позволяет лениво загружать на уровне шаблона. Компоненты внутри @defer загружаются только при выполнении условия триггера.

**Кейсы использования:**
- Контент ниже видимой области — загрузить при появлении
- Тяжёлые компоненты — загрузить по взаимодействию
- Условные фичи — загрузить, только если пользователю нужны

**Триггеры:**
- on viewport — при попадании в область видимости (по умолчанию)
- on idle — когда браузер простаивает
- on interaction — клик, фокус и т.д.
- on hover — наведение мыши
- on timer(Xms) — после задержки
- when condition — пользовательское условие

**Состояния:**
- @placeholder — отображается изначально (не загружается лениво)
- @loading — пока загружается чанк
- @error — если загрузка не удалась`,
      codeSnippets: [
        {
          language: 'html',
          code: `<!-- Базовый defer с триггером viewport -->
@defer (on viewport) {
  <app-analytics-chart [data]="chartData" />
} @placeholder {
  <div class="chart-skeleton">Загрузка графика...</div>
} @loading (minimum 500ms) {
  <app-spinner />
} @error {
  <div>Не удалось загрузить график</div>
}`,
        },
        {
          language: 'html',
          code: `<!-- Триггер по взаимодействию с предзагрузкой -->
@defer (on interaction; prefetch on hover) {
  <app-heavy-modal [config]="modalConfig" />
} @placeholder {
  <button>Открыть настройки</button>
}

<!-- Триггер по таймеру -->
@defer (on timer(2000)) {
  <app-recommendations />
}`,
        },
        {
          language: 'html',
          code: `<!-- Условный defer -->
@defer (when hasAdminAccess) {
  <app-admin-panel />
}

<!-- Комбинирование триггеров -->
@defer (on viewport; on timer(5000)) {
  <app-footer-widgets />
}`,
        },
      ],
    },

    {
      id: 'ng-7',
      question: 'switchMap vs mergeMap vs concatMap vs exhaustMap',
      answer: `Эти операторы разворачивают внутренние Observable, но отличаются обработкой параллельных эмиссий.

| Оператор | Поведение | Кейс использования |
|----------|-----------|-------------------|
| switchMap | Отменяет предыдущий, берёт последний | Поиск, автокомплит |
| mergeMap | Запускает все параллельно | Пакетные операции |
| concatMap | Ставит в очередь, выполняет последовательно | Порядко-зависимые операции |
| exhaustMap | Игнорирует новые, пока занят | Отправка формы, логин |

**Правило:** Всегда отписывайся или используй takeUntil/takeUntilDestroyed.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// switchMap — поиск (отменяет предыдущий)
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.searchService.search(query))
).subscribe(results => this.results = results);`,
        },
        {
          language: 'typescript',
          code: `// exhaustMap — отправка формы (игнорирует пока занят)
submitClicks$.pipe(
  exhaustMap(() => this.orderService.submit(this.form.value))
).subscribe({
  next: () => this.router.navigate(['/success']),
  error: (e) => this.showError(e)
});`,
        },
        {
          language: 'typescript',
          code: `// concatMap — порядко-зависимые операции
files$.pipe(
  concatMap(file => this.uploadService.upload(file))
).subscribe(result => this.uploadedFiles.push(result));`,
        },
        {
          language: 'typescript',
          code: `// Предотвращение утечек памяти
// Вариант 1: takeUntilDestroyed (Angular 16+)
private _userService = inject(UserService);
public user$ = this._userService.getUser().pipe(
  takeUntilDestroyed()
);

// Вариант 2: async pipe
@Component({
  template: \`@if (user$ | async; as user) { {{ user.name }} }\`
})

// Вариант 3: DestroyRef
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
      question: 'Объясни guards и resolvers в Angular Router',
      answer: `Guards контролируют навигацию, resolvers предзагружают данные.

**Guards (возвращают boolean/UrlTree/Observable):**
- canActivate — можно ли перейти НА маршрут?
- canDeactivate — можно ли покинуть маршрут? (несохранённые изменения)
- canMatch — может ли маршрут вообще совпасть? (фича-флаги)
- canActivateChild — для всех дочерних маршрутов

**Resolvers:** Загружают данные ДО активации маршрута. Компонент получает данные сразу.

**Современный подход:** Используй функциональные guards/resolvers с inject().`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Функциональный auth guard
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

// маршруты
{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }`,
        },
        {
          language: 'typescript',
          code: `// canDeactivate — несохранённые изменения
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = 
  (component) => {
    if (component.canDeactivate()) return true;
    return confirm('У вас есть несохранённые изменения. Уйти?');
  };`,
        },
        {
          language: 'typescript',
          code: `// Функциональный resolver
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  const id = route.paramMap.get('id')!;
  return userService.getUser(id);
};

// маршруты
{ path: 'users/:id', component: UserDetailComponent, resolve: { user: userResolver } }

// компонент
user = toSignal(this.route.data.pipe(map(d => d['user'])));`,
        },
      ],
    },

    {
      id: 'ng-9',
      question: 'Template-driven vs Reactive формы — когда что использовать?',
      answer: `**Template-driven:** Логика в шаблоне, проще, подходит для базовых форм.
**Reactive:** Логика в TypeScript, тестируемо, подходит для сложных/динамических форм.

| Аспект | Template-driven | Reactive |
|--------|-----------------|----------|
| Настройка | FormsModule, ngModel | ReactiveFormsModule, FormGroup |
| Валидация | Директивы | Функции |
| Тестирование | Сложнее (нужен DOM) | Проще (чистые функции) |
| Динамика | Ограничена | Полный контроль |

**Правило:** Форма логина → template-driven. Многошаговый визард → reactive.`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Reactive-форма с валидацией
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
          code: `// Кастомный асинхронный валидатор
export function uniqueUsernameValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    
    return userService.checkUsername(control.value).pipe(
      map(isTaken => isTaken ? { usernameTaken: true } : null),
      catchError(() => of(null))
    );
  };
}

// Использование — асинхронные валидаторы = 3-й параметр
this._fb.group({
  username: ['', [Validators.required], [uniqueUsernameValidator(this._userService)]]
});`,
        },
        {
          language: 'typescript',
          code: `// FormArray для динамических полей
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
      question: 'Как оптимизировать производительность Angular-приложения?',
      answer: `Оптимизация производительности охватывает время сборки, размер бандла и рантайм.

**Размер бандла:**
- Ленивая загрузка маршрутов и компонентов (@defer)
- Tree-shaking неиспользуемого кода (standalone помогает)
- Анализ бандла: source-map-explorer
- Импортируй конкретные модули, а не целые библиотеки

**Рантайм:**
- OnPush change detection везде
- trackBy / track в @for — избежать пересоздания DOM
- Виртуальный скроллинг для длинных списков
- Мемоизация тяжёлых вычислений (computed signals)
- runOutsideAngular для не-UI операций

**Загрузка:**
- SSR + гидратация для FCP
- Предзагрузка критичных маршрутов
- Используй @defer с prefetch`,
      codeSnippets: [
        {
          language: 'typescript',
          code: `// Виртуальный скроллинг для длинных списков
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
          code: `// Стратегия предзагрузки маршрутов
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
};`,
        },
        {
          language: 'bash',
          code: `# Анализ бандла
ng build --stats-json
npx source-map-explorer dist/app/browser/*.js`,
        },
      ],
    },
  ],
};
