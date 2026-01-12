import { InjectionToken, Injector, ProviderToken, TemplateRef } from '@angular/core';
import { ButtonVariant, StylingMode } from '../button/button.types';

export const DIALOG_DATA = new InjectionToken('DialogData');

export type DialogConfig = {
  id?: string;
  data?: unknown;
  size?: 'small' | 'medium' | 'large';
  position?:
    | 'bottom'
    | 'center'
    | 'left'
    | 'top'
    | 'right'
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | Partial<Record<'top' | 'bottom' | 'left' | 'right', string>>;
  customWidth?: string;
  header?: string;
  text?: string;
  isBlurred?: boolean;
  showBackButton?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showHeader?: boolean;
  hideOnOutsideClick?: boolean;
  externalClass?: string;
  customHeaderTemplate?: TemplateRef<unknown>;
  customFooterTemplate?: TemplateRef<unknown>;
  additionalButton?: ButtonConfig | string;
  cancelButton?: ButtonConfig | string;
  submitButton?: ButtonConfig | string;
  enableKeyboardNavigation?: boolean;
  activeButton?: 'submit' | 'cancel';
  context?: {
    injector: Injector;
    tokens: ProviderToken<unknown>[];
  };
};

export type ButtonConfig = {
  stylingMode?: StylingMode;
  variant?: ButtonVariant;
  label: string;
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
};
