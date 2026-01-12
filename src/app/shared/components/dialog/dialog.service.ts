import {
  ComponentRef,
  Injectable,
  Injector,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';

import { DIALOG_DATA, DialogConfig } from './dialog.types';
import { DialogComponent } from './dialog.component';
import { DialogRef } from './dialog-ref.service';


@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly _modals: ComponentRef<DialogComponent>[] = [];

  private _vcr!: ViewContainerRef;

  public get isAnyDialogOpen(): boolean {
    return this._modals.length > 0;
  }

  public setViewContainerRef(vcr: ViewContainerRef): void {
    this._vcr = vcr;
  }

  public open<T = unknown>(
    componentOrElement: Type<T> | TemplateRef<any> | null,
    config?: DialogConfig
  ): DialogComponent {
    const dialogRef = new DialogRef();
    const modalComponentRef = this._createComponent(dialogRef, config);

    dialogRef.componentRef = modalComponentRef;

    this._modals.push(modalComponentRef);

    if (componentOrElement instanceof TemplateRef) {
      modalComponentRef.instance.templateRef = componentOrElement;
    } else {
      modalComponentRef.instance.componentType = componentOrElement;
    }

    modalComponentRef.instance.dialogId = config?.id;
    modalComponentRef.instance.size = config?.size ?? 'medium';
    modalComponentRef.instance.position = (config?.position as string) ?? 'center';
    modalComponentRef.instance.header = config?.header ?? '';
    modalComponentRef.instance.text = config?.text;
    modalComponentRef.instance.customWidth = config?.customWidth;
    modalComponentRef.instance.customHeaderTemplate = config?.customHeaderTemplate;
    modalComponentRef.instance.customFooterTemplate = config?.customFooterTemplate;
    modalComponentRef.instance.externalClass = config?.externalClass;
    modalComponentRef.instance.submitButton = config?.submitButton;
    modalComponentRef.instance.cancelButton = config?.cancelButton;
    modalComponentRef.instance.showBackButton = config?.showBackButton ?? false;
    modalComponentRef.instance.showCloseButton = config?.showCloseButton ?? true;
    modalComponentRef.instance.showHeader = config?.showHeader ?? true;
    modalComponentRef.instance.hideOnOutsideClick = config?.hideOnOutsideClick ?? false;
    modalComponentRef.instance.isBlurred = config?.isBlurred ?? false;
    modalComponentRef.instance.closeOnEscape = config?.closeOnEscape ?? true;
    modalComponentRef.instance.enableKeyboardNavigation = config?.enableKeyboardNavigation ?? true;
    const hasSubmitButton = !!config?.submitButton;
    const hasCancelButton = !!config?.cancelButton;
    const defaultActiveButton = hasCancelButton && !hasSubmitButton ? 'cancel' : 'submit';

    modalComponentRef.instance.activeButton = config?.activeButton ?? defaultActiveButton;
    modalComponentRef.instance.additionalActionButton = config?.additionalButton;

    modalComponentRef.instance.closed.subscribe(() => {
      this._close(modalComponentRef);
    });
    modalComponentRef.instance.open();
    return modalComponentRef.instance;
  }

  public closeAll(): void {
    const modalsCopy = [...this._modals];

    for (const componentRef of modalsCopy) {
      this._close(componentRef);
    }
  }

  private _close(componentRef: ComponentRef<DialogComponent>): void {
    const index = this._modals.indexOf(componentRef);
    if (index !== -1) {
      componentRef.destroy();
      this._modals.splice(index, 1);
    }

    componentRef.instance.submitted.complete();
  }

  private _createComponent(
    dialogRef: DialogRef,
    config?: DialogConfig
  ): ComponentRef<DialogComponent> {
    const modalInjector = Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        {
          provide: DIALOG_DATA,
          useValue: config?.data,
        },
        ...(config?.context?.tokens.map((token) => ({
          provide: token,
          useValue: config?.context?.injector.get(token, null, {
            optional: true,
          }),
        })) ?? []),
      ],
    });

    return this._vcr.createComponent(DialogComponent, {
      injector: modalInjector,
    });
  }
}
