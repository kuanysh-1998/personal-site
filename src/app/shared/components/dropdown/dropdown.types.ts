export type DropdownOptions = (DropdownOption & Record<string, unknown>)[];

export type DropdownValue = string | number | null | undefined | (string | number)[];

export interface DropdownOption {
  id: string | number;
  selected?: boolean;
  icon?: string;
}

export type DropdownChangeEvent = (string | number)[] | number | string | null;
