# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                      # ng serve — dev server at http://localhost:4200
npm run build                  # production build → dist/ (prebuild regenerates sitemap.xml)
npm run watch                  # development build in watch mode
npm test -- --watch=false      # ng test once — Vitest via @angular/build:unit-test
npm run lint                   # eslint . (flat config, ts + html)
npm run lint:fix               # eslint . --fix
npm run format                 # prettier --write over src/**/*.{ts,html,scss,json}
npm run format:check           # prettier --check (used by CI)
npm run generate:sitemap       # regenerate src/sitemap.xml from posts.data.ts
```

Run a single test file: `npm test -- --watch=false src/app/.../foo.spec.ts`. `ng test` errors if **zero** spec files match, so keep at least one.

Linting/formatting: ESLint flat config in `eslint.config.js` (angular-eslint, rules mirror `.cursor/rules`). Legacy-pattern rules (`prefer-inject`, template a11y, `no-explicit-any`, …) are set to **warn** so they surface without blocking CI — tighten them to `error` as the code is refactored. Prettier config: `.prettierrc.json` (single quotes, 100 print width). Type safety also enforced by TS `strict` + Angular `strictTemplates`.

CI: `.github/workflows/ci.yml` runs lint → format:check → test → build on push/PR to `main`.

## Conventions (from .cursor/rules — these are binding)

- **Standalone components/directives/pipes only.** No `NgModule`.
- **`inject()` over constructor DI** for new code. Private injected fields are prefixed with `_` (e.g. `_http`, `_localeService`).
- **Signals** for local component state; **RxJS** for async/API streams. State is held in services via BehaviorSubject/Subject — **no NgRx**.
- **Templates:** `@if`/`@for` control flow, not `*ngIf`/`*ngFor`. OnPush change detection where possible; avoid manual `detectChanges()`.
- **Forms:** reactive forms only.
- **Subscription cleanup:** `takeUntilDestroyed()` from `@angular/core/rxjs-interop`.
- **Services return `Observable<T>`** and do not subscribe internally (subscribe in components or use the `async` pipe). Use `catchError` for domain-specific handling. Avoid `any`.
- **Code/identifiers in English; comments and git commit messages in Russian.** (See git history for commit style — Conventional Commits prefix + Russian description.)
- **File naming:** kebab-case. Component prefix: `app-`. New components default to SCSS styles.
- **Import alias:** `@app/*` → `src/app/*` (defined in `tsconfig.app.json`).

## Architecture

Angular 21 SPA + PWA, all routes lazy-loaded. Layered directory structure:

- `src/app/core/` — singleton (`providedIn: 'root'`) services, registered together in `core.config.ts` → `coreProviders`. Covers theme, locale, emailjs, yandex-metrika, service-worker-update, local-storage, plus the Transloco HTTP loader. App-wide providers wire up in `app.config.ts` (router, HttpClient, Transloco, service worker, Firebase, svg-icon, markdown).
- `src/app/entities/<entity>/` — domain model + service split into `models/` and `services/` (currently just `post`).
- `src/app/features/` — lazy feature areas (about, blog, contact-form, main-layout, whats-new, not-found). Each is loaded via `loadComponent` in `app.routes.ts`. The `main-layout` feature is the shell that wraps child routes; `''` redirects to `about`.
- `src/app/shared/` — reusable components, pipes, directives, constants.

### Blog content model

Posts are **not** in a CMS or database — they are static markdown files plus a hardcoded metadata array:

- Metadata lives in `src/app/features/blog/data/posts.data.ts` (`POSTS: PostMetadata[]` — title, date, slug, description, tags).
- Markdown bodies live in `src/assets/posts/<lang>/<slug>.md`, fetched at runtime by `PostService` (`src/app/entities/post/services/post.service.ts`) via `HttpClient` based on the active locale.
- `PostService` also derives ordering (newest-first), prev/next navigation, year grouping, tag-based related posts, and title/description/slug search — all from the in-memory `POSTS` array.
- **To add a post:** add an entry to `posts.data.ts` AND create the markdown file(s) under `src/assets/posts/<lang>/`.

### i18n (Transloco)

- Three locales: `en` (default + fallback), `ru`, `kk`. UI strings in `src/assets/i18n/{en,ru,kk}.json`.
- `LocaleService` initializes the active language via `provideAppInitializer` in `app.config.ts` before the app renders.
- Post titles/descriptions in `posts.data.ts` are Transloco keys, translated at display/search time.
- Missing-translation handling falls back to the `en` value. For posts: if a localized markdown file is missing (server returns HTML/404), non-`en` locales surface `unavailableInLanguage: true` while `en` returns `post: null`.

### Other integrations

- **SeoService** (`core/services/seo`) — sets `Title`/`Meta`/Open Graph/Twitter/canonical per route; page components call `seo.update({...})` in `ngOnInit` and re-run on `langChanges$`. Post pages use `type: 'article'`. `sitemap.xml` is generated from `posts.data.ts` by `scripts/generate-sitemap.mjs` (runs on `prebuild`) — do not hand-edit it. Note: still a client-rendered SPA (no SSR/prerender yet), so tags are set at runtime.
- **Firebase** (`@angular/fire`) — Realtime Database, configured from `environment.firebaseConfig`.
- **EmailjsService** — contact form submission via `@emailjs/browser`; ids in `environment.emailjs`.
- **PWA** — service worker via `ngsw-config.json`, registered `registerWhenStable:3000`; `ServiceWorkerUpdateService` handles update prompts.
- **ngx-markdown + Prism.js** — markdown rendering with syntax highlighting. Prism theme is a global style in `angular.json`; the Prism JS + language components are imported inside the lazy `post-detail` component (not global `scripts[]`) so they stay out of the initial bundle. Add a language → add its `import 'prismjs/components/prism-<lang>'` there.
- **Deploy (Vercel)** — `vercel.json` rewrites non-file routes to `/index.html` (SPA deep-link support). Output is the Angular application builder's `dist/personal-site/browser`.
- Environment config is a single `src/environments/environment.ts` (no separate prod file); it contains live service ids/keys, so treat it as sensitive.
