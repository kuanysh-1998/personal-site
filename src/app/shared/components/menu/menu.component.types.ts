import { ListItem } from '../list-item/list-item.component.types';
import { PopoverPosition } from '../popover/popover.types';

export type MenuSettings = {
  for: Element | string | number | undefined;
  items: ListItem[];
  padding: 'small' | 'medium' | 'large';
  position: PopoverPosition;
  header: string | undefined;
  minWidth: number | undefined;
};
