export const STORAGE_KEYS = {
  LOCALE: 'locale',
  THEME: 'theme',
  VIEWED_POSTS: 'viewed_posts',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
