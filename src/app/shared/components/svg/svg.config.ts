export const ICON_DEFAULT_SIZE = {
  default: { width: '1.25rem', height: '1.25rem' },
  small: { width: '1rem', height: '1rem' },
  large: { width: '1.5rem', height: '1.5rem' },
} as const;

export type IconSize = keyof typeof ICON_DEFAULT_SIZE;

export enum Icons {
  Checkmark = 'checkmark',
  CopyIcon = 'copy-icon',
  Cross = 'i_toast_close',
  Info = 'i_info',
  Search = 'search-icon',
  Close = 'close-icon',
}
