# Обновления через Angular Service Worker

Выкатили критический фикс в прод. Через несколько часов пользователи по-прежнему жалуются на тот же баг. Знакомо? Браузер отдаёт закэшированный JavaScript старой версии, и никто не делает обновление страницы.

## В чём реальная проблема

После деплоя пользователи продолжают работать со старой версией кода, пока вручную не обновят страницу. Из-за этого:

- Ломающие изменения бьют по закэшированному старому коду
- После каждого релиза растёт поток тикетов в поддержку
- «Попробуйте Ctrl+F5» превращается в стандартный ответ
- Потеря времени из-за пользователей, застрявших на сломанной версии

## Зачем нужны Service Workers

Service Worker стоит между приложением и сетью и управляет кэшированием. С Angular Service Worker можно:

- Автоматически обнаруживать новые версии
- Умно кэшировать ассеты
- Уведомлять пользователей о доступных обновлениях
- Аккуратно обрабатывать процесс обновления

**Важно:** Не принуждать к обновлению. Пусть пользователь сам решает, когда перезагрузить — он может быть в середине работы.

## Реализация

### Шаг 1: Подключить Angular PWA

```bash
ng add @angular/pwa
```

Команда добавляет поддержку Service Worker и создаёт начальные конфиги.

### Шаг 2: Настроить стратегию кэширования

Создайте или обновите `ngsw-config.json`:

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/manifest.webmanifest", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|jpg|jpeg|png|webp|woff|woff2)"]
      }
    }
  ]
}
```

**Стратегии:**

- `prefetch` — загружать сразу (критичные файлы приложения)
- `lazy` — загружать при первом обращении (картинки, шрифты)

### Шаг 3: Включить в конфиге Angular

В `angular.json` в конфигурации production:

```json
"production": {
  "serviceWorker": true,
  "ngswConfigPath": "ngsw-config.json"
}
```

### Шаг 4: Сервис обнаружения обновлений

Создайте `service-worker-update.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';
import { filter, switchMap, catchError, take } from 'rxjs/operators';
import { timer, EMPTY, Subject, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class ServiceWorkerUpdateService {
  private _updateAvailable = false;
  private _dialogOpen = false;
  private readonly HOUR_MS = 60 * 60 * 1000; // Проверка раз в час
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _swUpdate: SwUpdate,
    private readonly _router: Router,
    private readonly _dialogService: DialogService
  ) {}

  public checkForUpdates(): void {
    if (!this._swUpdate.isEnabled) {
      console.log('[SW] Service Worker не включён');
      return;
    }

    // Слушаем события новой версии
    this._swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[SW] Доступна новая версия');
        this._updateAvailable = true;
        this._promptUpdate();
      });

    // Периодическая проверка (раз в час)
    timer(0, this.HOUR_MS)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError((err) => {
          console.error('[SW] Ошибка проверки обновления:', err);
          return EMPTY;
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    // Проверка при навигации
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        if (this._updateAvailable) {
          this._promptUpdate();
        } else {
          this._swUpdate
            .checkForUpdate()
            .catch((err) => console.error('[SW] Ошибка проверки при навигации:', err));
        }
      });
  }

  private _promptUpdate(): void {
    if (this._dialogOpen) return;

    this._dialogOpen = true;

    const dialog = this._dialogService.open(null, {
      header: 'Доступно обновление',
      text: 'Вышла новая версия. Обновить сейчас?',
      submitButton: 'Обновить',
      cancelButton: 'Позже',
      closeOnEscape: false,
      hideOnOutsideClick: false,
    });

    // Обработка перезагрузки
    dialog.submitted.pipe(take(1)).subscribe(() => this._reloadApp(dialog));

    // Обработка отмены
    merge(dialog.canceled, dialog.closed)
      .pipe(take(1))
      .subscribe(() => this._closeDialog(dialog));
  }

  private _reloadApp(dialog: DialogComponent): void {
    this._swUpdate
      .activateUpdate()
      .then(() => {
        console.log('[SW] Обновление активировано, перезагрузка...');
        location.reload();
      })
      .catch((err) => {
        console.error('[SW] Ошибка активации:', err);
        this._closeDialog(dialog);
      });
  }

  private _closeDialog(dialog: DialogComponent): void {
    dialog.close();
    this._dialogOpen = false;
  }

  public destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
```

**Важные решения:**

- Проверка раз в час (без лишней нагрузки)
- Проверка при навигации (ловим обновления в процессе работы)
- Пользователь сам решает, когда обновиться (без принудительной перезагрузки)
- Один экземпляр диалога (избегаем спама)

### Шаг 5: Инициализация в корневом компоненте

```typescript
// app.component.ts
export class AppComponent implements OnInit, OnDestroy {
  constructor(private readonly _swUpdateService: ServiceWorkerUpdateService) {}

  public ngOnInit(): void {
    this._swUpdateService.checkForUpdates();
  }

  public ngOnDestroy(): void {
    this._swUpdateService.destroy();
  }
}
```

### Шаг 6: Регистрация Service Worker

В `app.config.ts`:

```typescript
import { ServiceWorkerModule } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        // Регистрация после стабилизации приложения (не блокирует первую загрузку)
        registrationStrategy: 'registerWhenStable:3000',
      })
    ),
    ServiceWorkerUpdateService,
  ],
};
```

## Типичные ошибки

### 1. Слишком частые проверки обновлений

**Плохо:**

```typescript
timer(0, 60000); // Каждую минуту — лишняя нагрузка на сервер
```

**Хорошо:**

```typescript
timer(0, this.HOUR_MS); // Раз в час + проверки при навигации
```

### 2. Принудительная перезагрузка без согласия пользователя

**Плохо:**

```typescript
this.swUpdate.activateUpdate().then(() => location.reload());
// Пользователь теряет несохранённые данные
```

**Хорошо:**

```typescript
// Показываем диалог, пользователь сам выбирает момент
if (userClickedReload) {
  this.swUpdate.activateUpdate().then(() => location.reload());
}
```

### 3. Включение в режиме разработки

Service Worker агрессивно кэширует. При разработке:

```typescript
ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production, // Отключено в dev
});
```

Используйте `ng serve` — он автоматически отключает Service Worker.

### 4. Игнорирование ошибок

Проверки обновлений всегда оборачивайте в обработку ошибок:

```typescript
this.swUpdate.checkForUpdate().catch((err) => console.error('[SW] Ошибка проверки:', err));
```

## Тестирование в production-режиме

### Локальное тестирование

```bash
# Сборка production
ng build --configuration production

# Запуск через HTTP-сервер
npx http-server dist/your-app -p 8080

# Открыть localhost:8080
```

**Проверка в DevTools:**

1. DevTools → Application → Service Workers
2. Включить «Update on reload» для тестов
3. Внести изменение, пересобрать, обновить страницу
4. Должна определиться новая версия

### Проверка на проде

1. Задеплоить новую версию
2. Открыть приложение в браузере
3. В консоли искать `[SW] Доступна новая версия` (или `[SW] New version available`)
4. Убедиться, что появляется диалог
5. Нажать «Обновить» — должна загрузиться новая версия

## Решение проблем

### Service Worker не регистрируется

**Проверить:**

- Должен быть HTTPS (или localhost)
- В `dist/` есть `ngsw-worker.js`
- Консоль на ошибки регистрации
- DevTools → Application → Service Workers

**Что сделать:**

```bash
# Убедиться, что сборка production
ng build --configuration production

# Проверить наличие ngsw-worker.js
ls dist/your-app/ngsw-worker.js
```

### Обновления не обнаруживаются

**Возможные причины:**

- Хеш в `ngsw.json` не изменился
- Проблемы с кэшем браузера
- Service Worker застрял в старом состоянии

**Что сделать:**

```typescript
// В DevTools → Application → Service Workers
// Нажать «Unregister» у старого воркера
// Обновить страницу — зарегистрируется новый воркер
```

### Диалог показывается несколько раз

**Проблема:** создаётся несколько экземпляров диалога

**Решение:**

```typescript
private _promptUpdate(): void {
  if (this._dialogOpen) return; // Защита от повторного вызова
  this._dialogOpen = true;
  // ... остальной код
}
```

## Результат после внедрения

**До:**

- 10–15 тикетов в поддержку после каждого деплоя
- Пользователи часами на сломанной версии
- Ручные объявления о критичных обновлениях

**После:**

- Нулевые тикеты из-за кэша
- Около 95% пользователей обновляются в течение 30 минут
- Предсказуемый процесс деплоя
- Время обновления выбирает пользователь

## Дополнительно: аналитика обновлений

При желании можно отслеживать принятие обновлений:

```typescript
private _promptUpdate(): void {
  // ... код диалога

  dialog.submitted.subscribe(() => {
    // Событие: обновление принято
    this.analytics.track('sw_update_accepted');
    this._reloadApp(dialog);
  });

  dialog.canceled.subscribe(() => {
    // Событие: обновление отложено
    this.analytics.track('sw_update_dismissed');
    this._closeDialog(dialog);
  });
}
```

## Главное

1. **Проверять обновления с умом** — раз в час и при навигации, не каждую минуту
2. **Момент обновления выбирает пользователь** — не перезагружать приложение во время работы
3. **Отключать в разработке** — Service Worker мешает hot reload
4. **Обрабатывать ошибки** — сетевые сбои неизбежны
5. **Тестировать в production-режиме** — Service Worker работает только со production-сборкой

Service Workers аккуратно решают проблему кэша: пользователи получают обновления без потери работы, деплои перестают быть стрессом, тикеты в поддержку исчезают.

Главное преимущество: один раз настроил — и забыл. Настроил, задеплоил, и всё работает само.

---
