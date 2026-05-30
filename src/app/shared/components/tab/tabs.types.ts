import { TemplateRef } from '@angular/core';

export interface Tab {
  id: string;
  text?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  token?: string;
  template?: TemplateRef<any>;
  content?: TemplateRef<any>;
}
