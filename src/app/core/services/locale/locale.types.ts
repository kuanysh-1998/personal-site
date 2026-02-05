export const LOCALE_STORAGE_KEY = 'locale';

export const AVAILABLE_LANGS = ['en', 'ru', 'kk'] as const;
export type LocaleId = (typeof AVAILABLE_LANGS)[number];

export interface LocaleOption extends Record<string, unknown> {
  id: LocaleId;
  name: string;
}

export const LOCALE_NAMES: Record<LocaleId, string> = {
  en: 'English',
  ru: 'Русский',
  kk: 'Қазақша',
};
