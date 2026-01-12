import { Icons } from './svg.config';

export type SvgSettings = {
  icon: Icons | string | undefined;
  size: 'small' | 'default' | 'large';
  color: string | undefined;
  token: string | undefined;
  width: string | null | undefined;
  height: string | null | undefined;
  wrapperWidth: string | null | undefined;
  wrapperHeight: string | null | undefined;
};
