import { InjectionToken, Injector, ProviderToken, TemplateRef } from '@angular/core';

import { ListItem } from '../list-item/list-item.component.types';
import { UnknownDynamicType } from '../../types/common.types';
import { ButtonVariant, StylingMode } from '../button/button.types';

export const DRAWER_DATA = new InjectionToken('DrawerData');

export type DrawerConfig = {
  data?: unknown;
  header?: string;
  subheader?: string;
  showNavigation?: boolean;
  showBackButton?: boolean;
  customWidth?: string;
  additionalButton?: ButtonConfig | string;
  popoverButton?: ButtonConfig & {
    menuItems?: ListItem[];
  };
  submitButton?: ButtonConfig | string;
  cancelButton?: ButtonConfig | string;
  customFooterTemplate?: TemplateRef<UnknownDynamicType>;
  context?: {
    injector: Injector;
    tokens: ProviderToken<unknown>[];
  };
};

export type ButtonConfig = {
  stylingMode?: StylingMode;
  variant?: ButtonVariant;
  label: string;
  icon?: string | undefined;
  iconRight?: string;
  iconWidth?: string;
  iconHeight?: string;
  disabled?: boolean;
};
