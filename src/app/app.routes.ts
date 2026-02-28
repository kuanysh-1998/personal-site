import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/main-layout/pages/layout/main-layout.component').then(
        (c) => c.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'about',
        pathMatch: 'full',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/pages/about.component').then((c) => c.AboutComponent),
      },
      {
        path: 'blog',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/blog/pages/blog-list/blog-list.component').then(
                (c) => c.BlogListComponent,
              ),
          },
          {
            path: ':slug',
            loadComponent: () =>
              import('./features/blog/pages/post-detail/post-detail.component').then(
                (c) => c.PostDetailComponent,
              ),
          },
        ],
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then((c) => c.NotFoundComponent),
      },
    ],
  },
];
