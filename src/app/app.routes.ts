import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'about',
        pathMatch: 'full',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/pages/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'blog',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/blog/pages/blog-list/blog-list.component').then(
                (m) => m.BlogListComponent
              ),
          },
          {
            path: ':slug',
            loadComponent: () =>
              import('./features/blog/pages/post-detail/post-detail.component').then(
                (m) => m.PostDetailComponent
              ),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'about',
      },
    ],
  },
];
