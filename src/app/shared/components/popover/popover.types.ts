export type PopoverPosition =
  | 'top left'
  | 'bottom left'
  | 'top right'
  | 'bottom right'
  | 'left top'
  | 'left bottom'
  | 'right top'
  | 'right bottom'
  | 'top'
  | 'bottom'
  | 'right'
  | 'left';

export type PopoverSettings = {
  externalClass: string;
  minWidth: number | undefined;
  height: number | undefined;
  maxHeight: number | undefined;
  padding: 'small' | 'default';
  hideOnOutsideClick: ((event: any) => boolean) | boolean;
};
