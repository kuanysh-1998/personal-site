import { TemplateRef } from '@angular/core';

export type VariantSwitch = 'default' | 'warning' | 'danger' | 'success' | 'info';

export type SwitchSettings = {
  label: string;
  labelInfo: string | TemplateRef<any>;
  position: 'left' | 'right' | 'top';
  disabled: boolean;
  variant: VariantSwitch;
  requiredForLabel: boolean | undefined;
  token: string | undefined;
};
