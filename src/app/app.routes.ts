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
        loadComponent: () =>
          import('./features/blog/pages/blog.component').then((m) => m.BlogComponent),
      },
    ],
  },
];
