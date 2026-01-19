import { ComponentRef, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DrawerComponent } from './drawer.component';
import { UnknownDynamicType } from '../../types/common.types';
import { ButtonConfig } from './drawer.types';

export class DrawerRef {
  public submitData$$ = new BehaviorSubject<any>(undefined);
  public popoverData$$ = new BehaviorSubject<any>(undefined);

  private _componentRef!: ComponentRef<DrawerComponent>;
  private _canNavigate?: () => boolean;

  public get instance(): DrawerComponent | undefined {
    return this._componentRef?.instance;
  }

  public set componentRef(ref: ComponentRef<DrawerComponent>) {
    if (this._componentRef) {
      throw new Error('ComponentRef has already been set and cannot be modified.');
    }
    this._componentRef = ref;
  }

  public submit(): void {
    this._componentRef.instance.submitted.next(this.submitData$$.value);
  }

  public additionalAction(): void {
    this._componentRef.instance.additionalAction.next();
  }

  public cancel(): void {
    this._componentRef.instance.canceled.next();
  }

  public popover(): void {
    this._componentRef.instance.popoverButtonAction.next(this.popoverData$$.value);
  }

  public close(): void {
    if (this._componentRef) {
      this._componentRef.instance.close();
    }
  }

  public navigatePrevious(): void {
    if (this._componentRef) {
      this._componentRef.instance.previousNavigation.next();
    }
  }

  public navigateBack(): void {
    if (this._componentRef) {
      this._componentRef.instance.backNavigation.next();
    }
  }

  public updateHeader(header: string, subheader?: string): void {
    if (this._componentRef) {
      this._componentRef.instance.header = header;
      if (subheader !== undefined) {
        this._componentRef.instance.subheader = subheader;
      }
    }
  }

  public set customFooterTemplate(customFooterTemplate: TemplateRef<UnknownDynamicType>) {
    this._componentRef.instance.customFooterTemplate = customFooterTemplate;
  }

  public updateData(data: any): void {
    this.submitData$$.next(data);
  }

  public updateSubmitButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.submitButton = buttonConfig;
    }
  }

  public updateAdditionalButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.additionalActionButton = buttonConfig;
    }
  }

  public updateCancelButton(buttonConfig: ButtonConfig | string | undefined): void {
    if (this._componentRef) {
      this._componentRef.instance.cancelButton = buttonConfig;
    }
  }

  public hideAllButtons(): void {
    if (this._componentRef) {
      this._componentRef.instance.submitButton = undefined;
      this._componentRef.instance.additionalActionButton = undefined;
      this._componentRef.instance.cancelButton = undefined;
    }
  }

  public setNavigationGuard(canNavigate: () => boolean): void {
    this._canNavigate = canNavigate;
  }

  public canNavigate(): boolean {
    return this._canNavigate ? this._canNavigate() : true;
  }
}
