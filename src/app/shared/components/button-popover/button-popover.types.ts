import { ButtonVariant, StylingMode } from '../button/button.types';
import { ListItem } from '../list-item/list-item.component.types';
import { PopoverPosition } from '../popover/popover.types';

export type ButtonPopoverSettings = {
  stylingMode: StylingMode;
  variant: ButtonVariant;
  disabled: boolean;
  label: string;
  position: PopoverPosition;
  type: 'menu' | 'content';
  iconRight: string | null;
  menuItems: ListItem[];
  padding: 'small' | 'default';
  maxHeight: number | undefined;
  menuHeader: string | undefined;
  token: string | undefined;
  icon: string | undefined;
};
