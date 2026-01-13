import { UnknownDynamicType } from '@app/shared/types/common.types';

declare global {
  interface YmFunction {
    (...args: UnknownDynamicType[]): void;

    a?: UnknownDynamicType[];
    l?: number;
  }

  interface Window {
    ym: YmFunction;
  }
}
