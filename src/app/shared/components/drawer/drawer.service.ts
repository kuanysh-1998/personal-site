import { ComponentRef, Injectable, Injector, Type, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';

import { DRAWER_DATA, DrawerConfig } from './drawer.types';
import { DrawerComponent } from './drawer.component';
import { DrawerRef } from './drawer-ref.service';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _drawers: ComponentRef<DrawerComponent>[] = [];

  private _vcr!: ViewContainerRef;

  public setViewContainerRef(vcr: ViewContainerRef): void {
    this._vcr = vcr;
  }

  public open<T = unknown>(componentType: Type<T>, config?: DrawerConfig): DrawerComponent {
    const drawerRef = new DrawerRef();
    const drawerComponentRef = this._createComponent(drawerRef, config);

    drawerRef.componentRef = drawerComponentRef;

    this._drawers.push(drawerComponentRef);

    drawerComponentRef.instance.submitButton = config?.submitButton;
    drawerComponentRef.instance.additionalActionButton = config?.additionalButton;
    drawerComponentRef.instance.cancelButton = config?.cancelButton;
    drawerComponentRef.instance.popoverButton = config?.popoverButton;
    drawerComponentRef.instance.customFooterTemplate = config?.customFooterTemplate;
    drawerComponentRef.instance.header = config?.header ?? '';
    drawerComponentRef.instance.subheader = config?.subheader ?? '';
    drawerComponentRef.instance.showNavigation = config?.showNavigation ?? false;
    drawerComponentRef.instance.showBackButton = config?.showBackButton ?? false;
    drawerComponentRef.instance.customWidth = config?.customWidth ?? '420px';
    drawerComponentRef.instance.componentType = componentType;
    drawerComponentRef.instance.closed.pipe(take(1)).subscribe(() => {
      this._close(drawerComponentRef);
    });
    drawerComponentRef?.instance.open();
    return drawerComponentRef?.instance;
  }

  public closeAll(): void {
    const drawersCopy = [...this._drawers];

    for (const componentRef of drawersCopy) {
      this._close(componentRef);
    }
  }

  private _close(componentRef: ComponentRef<DrawerComponent>): void {
    const index = this._drawers.indexOf(componentRef);
    if (index !== -1) {
      componentRef.destroy();
      this._drawers.splice(index, 1);
    }
  }

  private _createComponent(
    drawerRef: DrawerRef,
    config?: DrawerConfig,
  ): ComponentRef<DrawerComponent> {
    const drawerInjector = Injector.create({
      providers: [
        { provide: DrawerRef, useValue: drawerRef },
        {
          provide: DRAWER_DATA,
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

    return this._vcr?.createComponent(DrawerComponent, {
      injector: drawerInjector,
    });
  }
}
