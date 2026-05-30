import { UnknownDynamicType } from '@app/shared/types/common.types';

export interface TooltipSettings {
  manualControl: boolean;
  shakeAnimation: boolean;
  maxWidth: number;
  onHover: boolean;
  offset: number;
  hideOnOutsideClick: ((event: UnknownDynamicType) => boolean) | boolean;
}
