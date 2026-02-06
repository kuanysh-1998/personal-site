# takeUntilDestroyed: автоматическая отписка в Angular

С этим сталкивался каждый Angular-разработчик: компонент подписывается на Observable, забывает отписаться, и вот уже утечка памяти тихо снижает производительность. Angular 16 представил `takeUntilDestroyed()` — нативное решение, которое устраняет целый класс подобных багов.

## Проблема утечки памяти

Когда компонент подписывается на Observable и не отписывается, подписка продолжает жить после уничтожения компонента. Это вызывает утечки памяти, неожиданное поведение и деградацию производительности.

```typescript
// Утечка памяти в процессе
@Component({...})
export class UserProfileComponent implements OnInit {
  public ngOnInit(): void {
    this.userService.getUser().subscribe(user => {
      this.user = user; // Всё ещё срабатывает после уничтожения компонента
    });
  }
}
```

Уйдите со страницы, вернитесь десять раз — теперь у вас десять «зомби»-подписок, каждая из которых вызывает коллбэки в уже уничтоженном компоненте.

## Старые решения

До Angular 16 существовало несколько подходов. Ни один не был идеален.

### Ручная отписка

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

**Минусы:** Много шаблонного кода. Легко забыть. Несколько подписок требуют массив или `Subscription.add()`.

### Subject + паттерн takeUntil

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

**Минусы:** Всё ещё шаблон. Нужно помнить и `next()`, и `complete()`. В каждом компоненте одни и те же 4 строки.

### Сторонние библиотеки

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

**Минусы:** Внешняя зависимость. Магия декораторов. Может ломаться при обновлении Angular. Дополнительный размер бандла.

## Появление takeUntilDestroyed

В Angular 16 появился `takeUntilDestroyed()` в `@angular/core/rxjs-interop`. Нативно. Без зависимостей. Просто работает.

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

Никакого `OnDestroy`. Никакого Subject. Никакого кода очистки. Angular делает всё сам.

## Как это работает

Внутри `takeUntilDestroyed()` используется `DestroyRef`, который Angular создаёт для каждого компонента, директивы, сервиса и пайпа. Когда компонент уничтожается, срабатывает `DestroyRef`, и оператор завершает Observable.

```typescript
// Что происходит под капотом (упрощённо)
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

## Базовое использование

### В компонентах

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

**Важно:** При вызове без аргументов `takeUntilDestroyed()` нужно использовать в контексте инъекции — в конструкторе, инициализаторе поля или фабричной функции с `inject()`.

### В сервисах

Работает так же. Когда сервис уничтожается (например, сервис, предоставленный компонентом), подписки автоматически очищаются.

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

### Несколько подписок

Никаких массивов и ручного учёта — просто добавляйте оператор к каждому Observable:

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

## Использование DestroyRef напрямую

Иногда подписку нужно делать вне контекста инъекции — в `ngOnInit`, обработчиках событий или вспомогательных функциях. Передавайте `DestroyRef` явно.

### В хуках жизненного цикла

```typescript
import { inject } from '@angular/core';

@Component({...})
export class SearchComponent implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _searchService = inject(SearchService);

  protected results: Result[] = [];

  public ngOnInit(): void {
    // Вне контекста инъекции — передаём _destroyRef
    this._searchService.results$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(results => this.results = results);
  }
}
```

### В методах

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

### Во вспомогательных функциях

Здесь `takeUntilDestroyed` раскрывается полностью — переиспользуемые функции, учитывающие жизненный цикл компонента:

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

// Использование в компоненте
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

## Реальный пример

Сервис обновлений Service Worker с несколькими подписками через `takeUntilDestroyed`:

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

    // Слушаем обновления версий
    this._swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this._updateAvailable = true;
        this._promptUpdate();
      });

    // Проверяем периодически
    timer(0, 60 * 60 * 1000)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError(() => EMPTY),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();

    // Проверяем при навигации
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
    // Показать диалог обновления
  }
}
```

Три подписки, никакой ручной очистки. При уничтожении сервиса все подписки завершаются автоматически.

## Когда он не нужен

Не каждой подписке нужен `takeUntilDestroyed`. Его можно не использовать в таких случаях:

### HTTP-запросы (один эмит)

HTTP завершается после одного ответа. Утечка невозможна.

```typescript
// takeUntilDestroyed не нужен
this.http.get('/api/data').subscribe(data => this.process(data));
```

**Исключение:** Если нужно отменить запрос при уничтожении компонента (например, долгий запрос) — тогда используйте его.

### Async Pipe

`async` пайп сам управляет жизненным циклом подписки:

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

### Signals с toSignal

`toSignal` сам управляет очисткой:

```typescript
@Component({...})
import { inject } from '@angular/core';

export class UserComponent {
  private readonly _userService = inject(UserService);
  protected readonly user = toSignal(this._userService.currentUser$);
  // Автоматически очищается
}
```

## Миграция с @ngneat/until-destroy

При использовании `@ngneat/until-destroy` миграция проста:

**До:**
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

**После:**
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

Или перенесите в конструктор:

```typescript
@Component({...})
export class MyComponent {
  constructor() {
    this.data$.pipe(takeUntilDestroyed()).subscribe();
  }
}
```

**Чеклист миграции:**
- Удалите `@ngneat/until-destroy` из `package.json`
- Уберите декораторы `@UntilDestroy()`
- Замените `untilDestroyed(this)` на `takeUntilDestroyed()`
- Для подписок в `ngOnInit`: инжектируйте `DestroyRef` и передавайте его, либо перенесите подписку в конструктор

## Частые ошибки

### Использование вне контекста инъекции

```typescript
// Ошибка: takeUntilDestroyed() вызван вне контекста инъекции
public ngOnInit(): void {
  this.data$.pipe(takeUntilDestroyed()).subscribe(); // Выбросит исключение!
}
```

**Решение:** Инжектируйте `DestroyRef` и передавайте его:

```typescript
private readonly _destroyRef = inject(DestroyRef);

public ngOnInit(): void {
  this.data$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
}
```

### Порядок операторов важен

Ставьте `takeUntilDestroyed` последним в pipe (перед `subscribe`):

```typescript
// Правильно
this.data$.pipe(
  filter(x => x > 0),
  map(x => x * 2),
  takeUntilDestroyed()
).subscribe();

// Работает, но менее эффективно — фильтрация продолжается после сигнала destroy
this.data$.pipe(
  takeUntilDestroyed(),
  filter(x => x > 0),
  map(x => x * 2)
).subscribe();
```

## Главное

1. **Используйте `takeUntilDestroyed()`** для любой долгоживущей подписки в компонентах и сервисах
2. **Без аргументов в контексте инъекции** — конструктор и инициализаторы полей
3. **Передавайте `DestroyRef`** при подписке в хуках жизненного цикла или методах
4. **Пропускайте** для HTTP-запросов, async pipe и `toSignal`
5. **Нативное решение** — без зависимостей, поддерживается командой Angular

Утечки памяти из-за забытых подписок решены. Один импорт, один оператор, никакого шаблонного кода.

---
