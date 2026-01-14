export type ListItem = {
  id?: number;
  text: string;
  visible?: boolean;
  action?: (value?: any) => void;
  disable?: boolean;
  icon?: string;
  rightIcon?: string;
  active?: boolean;
  withGap?: boolean;
  link?: string;
  token?: string;
};
