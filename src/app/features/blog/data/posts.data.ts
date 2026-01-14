import { PostMetadata } from '@app/entities/post/models/post.interface';

export const POSTS: PostMetadata[] = [
  {
    title: 'Angular Best Practices',
    date: '2026-01-11',
    slug: 'angular-best-practices',
    description: 'Essential patterns and anti-patterns for building modern Angular applications',
  },
  {
    title: '10 Qualities That Make You a Better Programmer',
    date: '2026-01-12',
    slug: '10-qualities-better-programmer',
    description: 'Mindsets and habits that separate good programmers from great ones',
  },
  {
    title: 'Solving the Cache Problem with Angular Service Worker',
    date: '2026-01-13',
    slug: 'angular-service-worker-updates',
    description: 'Automatically notify users about updates and handle version control gracefully',
  },
  {
    title: 'Why You Should Update Dependencies Regularly',
    date: '2026-01-14',
    slug: 'keep-dependencies-updated',
    description:
      'The hidden cost of delayed updates and a practical strategy to stay current without pain',
  },
];
