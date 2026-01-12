import { ComponentRef, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ButtonConfig } from './dialog.types';
import { DialogComponent } from './dialog.component';

export class DialogRef {
  public submitData$$ = new BehaviorSubject<any>(undefined);
  public additionalAction$$ = new BehaviorSubject<any>(undefined);

  private _componentRef!: ComponentRef<DialogComponent>;

  public get instance(): DialogComponent | undefined {
    return this._componentRef?.instance;
  }

  public set componentRef(ref: ComponentRef<DialogComponent>) {
    if (this._componentRef) {
      throw new Error('ComponentRef has already been set and cannot be modified.');
    }
    this._componentRef = ref;
  }

  public set customHeaderTemplate(customHeaderTemplate: TemplateRef<any>) {
    this._componentRef.instance.customHeaderTemplate = customHeaderTemplate;
  }

  public set customFooterTemplate(customFooterTemplate: TemplateRef<any>) {
    this._componentRef.instance.customFooterTemplate = customFooterTemplate;
  }

  public submit(): void {
    this._componentRef.instance.submitted.next(this.submitData$$.value);
  }

  public cancel(): void {
    this._componentRef.instance.canceled.next();
  }

  public return(): void {
    this._componentRef.instance.returned.next();
  }

  public additionalAction(): void {
    this._componentRef.instance.additionalAction.next(this.additionalAction$$.value);
  }

  public close(): void {
    if (this._componentRef) {
      this._componentRef.instance.close();
    }
  }

  public updateSubmitButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.submitButton = buttonConfig;
    }
  }

  public updateCancelButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.cancelButton = buttonConfig;
    }
  }

  public updateAdditionalButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.additionalActionButton = buttonConfig;
    }
  }
}
