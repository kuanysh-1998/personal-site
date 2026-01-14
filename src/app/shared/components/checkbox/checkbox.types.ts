import { Links } from '../link/link.types';

export type CheckboxSettings = {
  label: string;
  labelBold: boolean;
  disabled: boolean;
  error: boolean;
  tabIndex: number;
  variant: 'default' | 'warning' | 'success';
  padding: 'none' | 'default';
  requiredForLabel: boolean | undefined;
  token: string | undefined;
  links: Links | undefined;
  indeterminate: boolean;
};
