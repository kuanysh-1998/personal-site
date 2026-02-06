По мере развития Angular важно следовать актуальным практикам, чтобы строить поддерживаемые и быстрые приложения. В этом руководстве — ключевые паттерны и антипаттерны на основе опыта с Angular 17+.

## Современная архитектура компонентов

### Используйте standalone-компоненты

```typescript
// ❌ Старый способ с NgModule
@NgModule({
  declarations: [UserCard],
  imports: [CommonModule],
})
// ✅ Современный standalone
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
})
export class UserCard {}
```

Standalone-компоненты убирают лишний код и делают зависимости явными. Это основа современной архитектуры Angular.

### Включайте OnPush для change detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCard {}
```

**Зачем?** Angular движется в сторону реактивности на сигналах и приложений без Zone.js. OnPush упрощает будущие миграции и уже даёт прирост производительности.

## Реактивность без ошибок

### Сигналы для состояния

```typescript
// ❌ Избегайте мутаций сигнала
user = signal<User>({ name: 'martin' });
// Позже: user().name = 'john' // Обновление не сработает!

// ✅ Обновляйте иммутабельно
user.update((prev) => ({ ...prev, name: 'john' }));
```

**Основные приёмы:**

- `signal()` — для изменяемого состояния
- `computed()` — для производных значений
- `effect()` — для побочных эффектов (использовать умеренно)

### Когда сигналы, когда RxJS

**Сигналы подходят для:**

- состояния компонента
- производных значений
- простой реактивности

**RxJS — для:**

- потоков событий
- сложной асинхронной логики
- HTTP-запросов с возможностью отмены

```typescript
// ✅ Сигналы для состояния
currentUser = signal<User | null>(null);
isManager = computed(() => this.currentUser()?.role === 'manager');

// ✅ RxJS для событий
searchResults$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((query) => this.searchUsers(query)),
);
```

## Антипаттерны, которых стоит избегать

### 1. Функции в шаблоне

```typescript
// ❌ Плохо: функция вызывается при каждой проверке изменений
@for (team of teams; track team.id) {
  <li>{{ getManager(team)?.name }}</li>
}

// ✅ Хорошо: вычислить один раз
managedTeams = computed(() =>
  this.teams().map(team => ({
    ...team,
    manager: team.members.find(m => m.role === 'manager')
  }))
);
```

### 2. Прямая работа с DOM

```typescript
// ❌ Плохо
document.getElementById('my-button')?.click();

// ✅ Хорошо: используйте абстракции Angular
button = viewChild<ElementRef>('myButton');
```

### 3. Утечки памяти из-за подписок

```typescript
// ❌ Плохо: нет отписки
public ngOnInit(): void {
  this.data$.subscribe(data => this.process(data));
}

// ✅ Хорошо: автоочистка через DestroyRef
private readonly _destroyRef = inject(DestroyRef);

public ngOnInit(): void {
  this.data$
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(data => this.process(data));
}

// ✅ Вариант: вызов в конструкторе (контекст инъекции)
constructor() {
  this.data$
    .pipe(takeUntilDestroyed())
    .subscribe(data => this.process(data));
}
```

## Работа с формами

### Типизируйте реактивные формы

```typescript
private readonly _fb = inject(FormBuilder);

// ❌ Без типов
form = this._fb.group({
  title: [''],
});

// ✅ С типами
form = this._fb.group({
  title: this._fb.nonNullable.control<string>(''),
});

// ✅ Безопасный доступ к контролам
this.form.controls.title.value; // С проверкой типов!
```

### Не полагайтесь на доступ по строке

```typescript
// ❌ В шаблоне
<input formControlName="title">

// ✅ В шаблоне
<input [formControl]="form.controls.title">
```

## Оптимизация производительности

### Ленивая загрузка фич

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
  },
];
```

### track в циклах

```typescript
// ❌ Плохо: Angular пересоздаёт DOM при каждом изменении
@for (user of users; track $index) {
  <app-user-card [user]="user"/>
}

// ✅ Хорошо: track по уникальному id
@for (user of users; track user.id) {
  <app-user-card [user]="user"/>
}
```

### computed вместо геттеров

```typescript
// ❌ Плохо: пересчёт при каждой проверке
public get fullName(): string {
  return `${this.firstName()} ${this.lastName()}`;
}

// ✅ Хорошо: кэширование автоматически
fullName = computed(() =>
  `${this.firstName()} ${this.lastName()}`
);
```

## HTTP и работа с API

### Всегда отписывайтесь от HTTP

```typescript
// ✅ Даже если HTTP сам завершает поток
this.http
  .get('/api/users')
  .pipe(takeUntilDestroyed())
  .subscribe((users) => this.users.set(users));
```

**Зачем?** Если компонент уничтожится до завершения запроса, коллбэк всё равно выполнится и может обратиться к уже уничтоженным полям.

### Перехватчики для общих задач

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

## Маршрутизация

### Резолверы для загрузки данных

```typescript
// ❌ Загрузка в компоненте
public ngOnInit(): void {
  this.http.get(`/users/${this.userId()}`)
    .subscribe(user => this.user.set(user));
}

// ✅ Загрузка до перехода
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.params['id']);
};

// Конфиг маршрута
{
  path: 'users/:id',
  component: UserPage,
  resolve: { user: userResolver }
}
```

### Гарды для защиты маршрутов

```typescript
export const authenticatedGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) {
    return inject(Router).parseUrl('/login');
  }
  return true;
};
```

## Тестирование

**Ситуация (2026):** экосистема тестирования Angular в переходном состоянии.

- **Karma/Jasmine** — устаревают, но пока по умолчанию
- **Vitest** — быстрый, экспериментальная поддержка Angular
- **Jest** — быстрый, без реального браузера

Для новых проектов имеет смысл смотреть в сторону Vitest, несмотря на экспериментальный статус.

## Итог

Angular развивается в сторону:

- реактивности на сигналах
- change detection без Zone.js
- повсеместного использования standalone-компонентов

Внедряйте эти подходы уже сейчас. Важно:

1. Иммутабельные обновления состояния
2. Стратегия OnPush
3. Корректное управление подписками
4. Строгая типизация везде

Фреймворк становится удобнее — если им пользоваться правильно.
