import { TemplateRef } from '@angular/core';

export type Tab = {
  id: string;
  text?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  token?: string;
  template?: TemplateRef<any>;
  content?: TemplateRef<any>;
};
