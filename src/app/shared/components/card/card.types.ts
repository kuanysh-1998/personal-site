import { TemplateRef } from '@angular/core';

export type CardSettings = {
  padding: 'none' | 'small' | 'medium' | 'large';
  direction: 'horizontal' | 'vertical';
  enableExpand: boolean;
  clickable: boolean;
  header: string;
  stylingMode: 'default' | 'outline' | 'ghost' | 'secondary';
  fullHeight: boolean;
  templateHeader: TemplateRef<any> | undefined;
  icon: string | undefined;
  iconRight: string | undefined;
  token: string | undefined;
  isExpanded: boolean;
};
