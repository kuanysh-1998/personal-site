import { PopoverPosition } from '../popover/popover.types';

export type VariantBadge = 'default' | 'secondary' | 'warning' | 'error' | 'success';

export type BadgeSettings = {
  size: 'small' | 'medium' | 'large';
  stylingMode: 'contained' | 'outlined' | 'ghost';
  variant: VariantBadge;
  asIcon: boolean;
  iconClickable: boolean;
  iconRightClickable: boolean;
  enableTooltip: boolean;
  tooltipPosition: PopoverPosition;
  text: string | number;
  icon: string | undefined;
  iconRight: string | undefined;
  token: string | undefined;
};
