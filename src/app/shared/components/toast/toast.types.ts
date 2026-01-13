export type Message = {
  type?: ToastType;
  header: string;
  message: string;
};

export enum ToastType {
  Success = 'success',
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
}
