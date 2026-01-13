Deployed a critical bug fix to production. Users still report the same bug hours later. Sound familiar? Their browsers are serving cached JavaScript from the old version, and nobody's hitting refresh.

## The Real Problem

After deploying updates, users continue running outdated code until they manually refresh. This causes:

- Breaking changes hit cached old code
- Support tickets flood in after every deployment
- "Have you tried Ctrl+F5?" becomes your standard response
- Lost productivity from users stuck on broken versions

**The breaking point:** A customer missed a deadline because their app crashed due to incompatible cached assets after our deployment.

Time to fix this properly with Angular Service Worker.

## Why Service Workers?

Service Workers sit between your app and the network, controlling cache behavior. With Angular's Service Worker:

- Automatically detect new versions
- Cache assets intelligently
- Notify users when updates are available
- Handle the update process gracefully

**Key insight:** Don't force updates. Let users choose when to reload. They might be mid-work.

## Implementation

### Step 1: Add Angular PWA

```bash
ng add @angular/pwa
```

This adds Service Worker support and generates initial config files.

### Step 2: Configure Caching Strategy

Create or update `ngsw-config.json`:

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

**Strategy:**

- `prefetch`: Download immediately (critical app files)
- `lazy`: Download on first use (images, fonts)

### Step 3: Enable in Angular Config

Update `angular.json` production configuration:

```json
"production": {
  "serviceWorker": true,
  "ngswConfigPath": "ngsw-config.json"
}
```

### Step 4: Build Update Detection Service

Create `service-worker-update.service.ts`:

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
  private readonly HOUR_MS = 60 * 60 * 1000; // Check every hour
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _swUpdate: SwUpdate,
    private readonly _router: Router,
    private readonly _dialogService: DialogService
  ) {}

  public checkForUpdates(): void {
    if (!this._swUpdate.isEnabled) {
      console.log('[SW] Service Worker not enabled');
      return;
    }

    // Listen for version updates
    this._swUpdate.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        console.log('[SW] New version available');
        this._updateAvailable = true;
        this._promptUpdate();
      });

    // Check periodically (every hour)
    timer(0, this.HOUR_MS)
      .pipe(
        switchMap(() => this._swUpdate.checkForUpdate()),
        catchError((err) => {
          console.error('[SW] Update check failed:', err);
          return EMPTY;
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    // Check on navigation
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
            .catch((err) => console.error('[SW] Navigation check failed:', err));
        }
      });
  }

  private _promptUpdate(): void {
    if (this._dialogOpen) return;

    this._dialogOpen = true;

    const dialog = this._dialogService.open(null, {
      header: 'Update Available',
      text: 'A new version is available. Reload now?',
      submitButton: 'Reload',
      cancelButton: 'Later',
      closeOnEscape: false,
      hideOnOutsideClick: false,
    });

    // Handle reload
    dialog.submitted.pipe(take(1)).subscribe(() => this._reloadApp(dialog));

    // Handle dismiss
    merge(dialog.canceled, dialog.closed)
      .pipe(take(1))
      .subscribe(() => this._closeDialog(dialog));
  }

  private _reloadApp(dialog: DialogComponent): void {
    this._swUpdate
      .activateUpdate()
      .then(() => {
        console.log('[SW] Update activated, reloading...');
        location.reload();
      })
      .catch((err) => {
        console.error('[SW] Activation failed:', err);
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

**Key decisions:**

- Check every hour (not too aggressive)
- Check on navigation (catch updates during normal use)
- User controls when to update (no forced reloads)
- Single dialog instance (avoid spam)

### Step 5: Initialize in App Component

```typescript
// app.component.ts
export class AppComponent implements OnInit, OnDestroy {
  constructor(private swUpdateService: ServiceWorkerUpdateService) {}

  ngOnInit() {
    this.swUpdateService.checkForUpdates();
  }

  ngOnDestroy() {
    this.swUpdateService.destroy();
  }
}
```

### Step 6: Register Service Worker

In `app.config.ts`:

```typescript
import { ServiceWorkerModule } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        // Register after app stabilizes (doesn't block initial load)
        registrationStrategy: 'registerWhenStable:3000',
      })
    ),
    ServiceWorkerUpdateService,
  ],
};
```

## Common Pitfalls

### 1. Checking Updates Too Frequently

**Bad:**

```typescript
timer(0, 60000); // Every minute → hammers server
```

**Good:**

```typescript
timer(0, this.HOUR_MS); // Every hour + navigation checks
```

### 2. Forcing Reload Without Consent

**Bad:**

```typescript
this.swUpdate.activateUpdate().then(() => location.reload());
// User loses unsaved work
```

**Good:**

```typescript
// Show dialog, let user choose when
if (userClickedReload) {
  this.swUpdate.activateUpdate().then(() => location.reload());
}
```

### 3. Enabling in Development

Service Worker aggressively caches. During development:

```typescript
ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production, // Disable in dev
});
```

Use `ng serve` which automatically disables Service Worker.

### 4. Not Handling Errors

Always wrap update checks in error handlers:

```typescript
this.swUpdate.checkForUpdate().catch((err) => console.error('[SW] Check failed:', err));
```

## Testing in Production

### Local Testing

```bash
# Build production
ng build --configuration production

# Serve with HTTP server
npx http-server dist/your-app -p 8080

# Open localhost:8080
```

**Verify in DevTools:**

1. Open DevTools → Application → Service Workers
2. Check "Update on reload" for testing
3. Make a change, rebuild, refresh
4. Should see new version detected

### Production Verification

1. Deploy new version
2. Open app in browser
3. Check console for `[SW] New version available`
4. Verify dialog appears
5. Click "Reload" → should load new version

## Troubleshooting

### Service Worker Not Registering

**Check:**

- Must be HTTPS (or localhost)
- `ngsw-worker.js` exists in `dist/`
- Console for registration errors
- DevTools → Application → Service Workers

**Fix:**

```bash
# Ensure production build
ng build --configuration production

# Check ngsw-worker.js exists
ls dist/your-app/ngsw-worker.js
```

### Updates Not Detected

**Possible causes:**

- `ngsw.json` hash didn't change
- Browser cache issues
- Service Worker stuck in old state

**Fix:**

```typescript
// In DevTools → Application → Service Workers
// Click "Unregister" on old worker
// Refresh page → new worker registers
```

### Dialog Shows Multiple Times

**Problem:** Creating multiple dialog instances

**Fix:**

```typescript
private _promptUpdate(): void {
  if (this._dialogOpen) return; // Guard clause
  this._dialogOpen = true;
  // ... rest of code
}
```

## Results After Implementation

**Before:**

- 10-15 support tickets per deployment
- Users stuck on broken versions for hours
- Manual communication needed for critical updates

**After:**

- Zero cache-related support tickets
- 95% of users update within 30 minutes
- Smooth deployment experience
- Users control update timing

## Advanced: Update Analytics

Track update adoption (optional):

```typescript
private _promptUpdate(): void {
  // ... dialog code

  dialog.submitted.subscribe(() => {
    // Track update accepted
    this.analytics.track('sw_update_accepted');
    this._reloadApp(dialog);
  });

  dialog.canceled.subscribe(() => {
    // Track update dismissed
    this.analytics.track('sw_update_dismissed');
    this._closeDialog(dialog);
  });
}
```

## Key Takeaways

1. **Check updates smartly** — hourly + on navigation, not every minute
2. **User controls timing** — never force reload mid-work
3. **Disable in development** — Service Worker fights hot reload
4. **Handle errors gracefully** — network failures happen
5. **Test in production** — Service Worker only works with production builds

Service Workers solve the cache problem elegantly. Users stay updated without losing work, deployments become stress-free, and support tickets disappear.

The best part? Once configured, it just works. Set it, deploy it, forget it.

---
