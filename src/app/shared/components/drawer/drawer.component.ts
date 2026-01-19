import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
  TemplateRef,
  Type,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { DividerComponent } from '../divider/divider.component';

import { ButtonConfig } from './drawer.types';
import { ButtonPopoverComponent } from '../button-popover/button-popover.component';
import { ListItem } from '../list-item/list-item.component.types';
import { ButtonGroupComponent } from '../button-group/button-group.component';
import { UnknownDynamicType } from '../../types/common.types';
import { Icons } from '../svg/svg.config';
import { DrawerRef } from './drawer-ref.service';

@Component({
  selector: 'ng-drawer',
  imports: [
    CommonModule,
    DividerComponent,
    ButtonComponent,
    ButtonPopoverComponent,
    ButtonGroupComponent,
  ],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @ViewChild('drawerContainer')
  public drawerContainer!: ElementRef<HTMLDivElement>;

  @Input() public componentType: Type<unknown> | null = null;
  @Input() public header = '';
  @Input() public subheader = '';
  @Input() public showNavigation = false;
  @Input() public showBackButton = false;
  @Input() public customWidth = '420px';

  @Input()
  public set additionalActionButton(value: ButtonConfig | string | undefined) {
    if (value === undefined || value === null) {
      this._additionalActionButton = undefined;
      return;
    }
    if (typeof value === 'string') {
      this._additionalActionButton = {
        label: value,
        variant: 'default',
        stylingMode: 'outlined',
      };
    } else {
      this._additionalActionButton = {
        variant: 'default',
        stylingMode: 'outlined',
        ...value,
      };
    }
  }

  @Input()
  public set submitButton(value: ButtonConfig | string | undefined) {
    if (value === undefined || value === null) {
      this._submitButton = undefined;
      return;
    }
    if (typeof value === 'string') {
      this._submitButton = {
        label: value,
        variant: 'default',
        stylingMode: 'contained',
      };
    } else {
      this._submitButton = {
        variant: 'default',
        stylingMode: 'contained',
        ...value,
      };
    }
  }

  @Input()
  public set cancelButton(value: ButtonConfig | string | undefined) {
    if (value === undefined || value === null) {
      this._cancelButton = undefined;
      return;
    }
    if (typeof value === 'string') {
      this._cancelButton = {
        label: value,
        variant: 'default',
        stylingMode: 'outlined',
      };
    } else {
      this._cancelButton = {
        variant: 'default',
        stylingMode: 'outlined',
        ...value,
      };
    }
  }

  @Input()
  public set popoverButton(value: ButtonConfig | undefined) {
    if (!value) return;
    this._popoverButton = {
      variant: 'default',
      stylingMode: 'outlined',
      ...value,
    };
  }

  @Input()
  public set customFooterTemplate(value: TemplateRef<UnknownDynamicType> | undefined) {
    this._customFooterTemplate = value;
    this._cdr.markForCheck();
  }

  @Output() public popoverButtonAction = new EventEmitter<void | unknown>();
  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<void | UnknownDynamicType>();
  @Output() public canceled = new EventEmitter<void>();
  @Output() public additionalAction = new EventEmitter<void>();
  @Output() public previousNavigation = new EventEmitter<void>();
  @Output() public nextNavigation = new EventEmitter<void>();
  @Output() public backNavigation = new EventEmitter<void>();

  public readonly iconsCross = Icons.Cross;
  public readonly iconsArrowLeft = Icons.ChevronLeft;
  public readonly iconsArrowRight = Icons.ChevronRight;

  public isDrawerOpen = signal(false);
  public filters?: unknown;

  private _additionalActionButton?: ButtonConfig;
  private _submitButton?: ButtonConfig;
  private _cancelButton?: ButtonConfig;
  private _popoverButton?: ButtonConfig;
  private _customFooterTemplate?: TemplateRef<UnknownDynamicType>;

  public get additionalActionButtonConfig(): ButtonConfig | undefined {
    return this._additionalActionButton;
  }

  public get submitButtonConfig(): ButtonConfig | undefined {
    return this._submitButton;
  }

  public get cancelButtonConfig(): ButtonConfig | undefined {
    return this._cancelButton;
  }

  public get popoverButtonConfig():
    | (ButtonConfig & {
        menuItems?: ListItem[];
      })
    | undefined {
    return this._popoverButton;
  }

  public get customFooterTemplate(): TemplateRef<UnknownDynamicType> | undefined {
    return this._customFooterTemplate;
  }

  constructor(
    private readonly _drawerRef: DrawerRef,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  public get isOpen(): boolean {
    return this.isDrawerOpen();
  }

  public open(): void {
    this.isDrawerOpen.set(true);
    setTimeout(() => this._focusOnDrawer(), 0);
  }

  public close(): void {
    this.isDrawerOpen.set(false);
    this.closed.emit();
  }

  public cancel(): void {
    this.canceled.emit();
  }

  public action(): void {
    this.additionalAction.emit();
  }

  public submit(): void {
    if (this._drawerRef?.instance) {
      this._drawerRef.submit();
      return;
    }
    this.submitted.emit();
  }

  public navigatePrevious(): void {
    this.previousNavigation.emit();
  }

  public navigateNext(): void {
    this.nextNavigation.emit();
  }

  public navigateBack(): void {
    this.backNavigation.emit();
  }

  private _focusOnDrawer(): void {
    if (this.drawerContainer && this.drawerContainer.nativeElement) {
      this.drawerContainer.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected onEscapeKey(event: Event): void {
    if (this.isDrawerOpen() && event instanceof KeyboardEvent) {
      event.preventDefault();
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.isDrawerOpen() || !this.showNavigation) {
      return;
    }

    if (!this._drawerRef?.canNavigate()) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.navigateNext();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigatePrevious();
        break;
      default:
        break;
    }
  }
}
