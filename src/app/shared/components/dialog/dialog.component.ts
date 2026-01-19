import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  signal,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { ButtonConfig } from './dialog.types';
import { DialogRef } from './dialog-ref.service';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  selector: 'ng-dialog',
  imports: [CommonModule, ButtonComponent, SvgComponent],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class') public hostClass = 'ng-dialog';

  @ViewChild('modalContent', { read: ElementRef })
  public modalContent!: ElementRef;
  @ViewChild('dialogContainer')
  public dialogContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('dialogTemplate', { static: true })
  public dialogTemplate!: TemplateRef<any>;

  @Input() public dialogId: string | undefined = undefined;
  @Input() public size = 'medium';
  @Input() public header = '';
  @Input() public showHeader = true;
  @Input() public hideOnOutsideClick = false;
  @Input() public position = 'center';
  @Input() public customWidth: string | undefined = undefined;

  @Input() public text: string | undefined = undefined;
  @Input() public isBlurred = false;
  @Input() public externalClass: string | undefined = undefined;
  @Input() public closeOnEscape = true;

  @Input()
  public set customHeaderTemplate(value: TemplateRef<unknown> | undefined) {
    if (!value) return;

    this._customHeaderTemplate = value;
  }

  @Input()
  public set customFooterTemplate(value: TemplateRef<unknown> | undefined) {
    if (!value) return;
    this._customFooterTemplate = value;
    this._cdr.markForCheck();
  }

  @Input()
  public set submitButton(value: ButtonConfig | string | undefined) {
    if (!value) {
      this._submitButton = undefined;
      this._cdr.markForCheck();
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
    this._cdr.markForCheck();
  }

  @Input()
  public set cancelButton(value: ButtonConfig | string | undefined) {
    if (!value) {
      this._cancelButton = undefined;
      this._cdr.markForCheck();
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
    this._cdr.markForCheck();
  }

  @Input()
  public set additionalActionButton(value: ButtonConfig | string | undefined) {
    if (!value) {
      this._additionalActionButton = undefined;
      this._cdr.markForCheck();
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
    this._cdr.markForCheck();
  }
  @Input() public showBackButton = false;

  @Input() public showCloseButton = true;

  @Input() public enableKeyboardNavigation = true;
  @Input() public activeButton: 'submit' | 'cancel' = 'submit';

  @Input() public componentType: Type<any> | null = null;
  @Input() public templateRef: TemplateRef<any> | null = null;

  @Output() public returned = new EventEmitter<void>();
  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<any>();
  @Output() public canceled = new EventEmitter<void>();
  @Output() public additionalAction = new EventEmitter<any>();

  public isVisible = signal<boolean>(false);

  protected readonly closeIcon = Icons.Cross;
  protected readonly arrowLeftIcon = Icons.Info;

  private _submitButton?: ButtonConfig;
  private _cancelButton?: ButtonConfig;
  private _additionalActionButton?: ButtonConfig;
  private _customHeaderTemplate?: TemplateRef<unknown>;
  private _customFooterTemplate?: TemplateRef<unknown>;
  private _embeddedView: EmbeddedViewRef<any> | null = null;
  private _resizeObserver!: ResizeObserver;
  private _windowResizeListener!: () => void;

  public get submitButtonConfig(): ButtonConfig | undefined {
    return this._submitButton;
  }

  public get additionalActionButtonConfig(): ButtonConfig | undefined {
    return this._additionalActionButton;
  }

  public get cancelButtonConfig(): ButtonConfig | undefined {
    return this._cancelButton;
  }

  public get customHeaderTemplate(): TemplateRef<unknown> | undefined {
    return this._customHeaderTemplate;
  }

  public get customFooterTemplate(): TemplateRef<unknown> | undefined {
    return this._customFooterTemplate;
  }

  public get getDialogWidth(): string {
    if (this.customWidth) {
      return this.customWidth;
    }

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      if (window.innerWidth <= 480) {
        return '95vw';
      }
      return '93vw';
    }

    if (this.size === 'large') {
      return '900px';
    } else if (this.size === 'medium') {
      return '500px';
    }
    return '404px';
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _dialogRef: DialogRef,
    private readonly _vcr: ViewContainerRef,
    private readonly _renderer: Renderer2,
  ) {}

  public ngAfterViewInit(): void {
    if (this.dialogContainer?.nativeElement) {
      this._resizeObserver = new ResizeObserver(() => {
        this._updatePosition();
        this._updateScrollableClass();
      });
      this._resizeObserver.observe(this.dialogContainer.nativeElement);

      this._windowResizeListener = () => {
        this._updatePosition();
        this._updateDialogWidth();
        this._updateScrollableClass();
      };

      window.addEventListener('resize', this._windowResizeListener);

      this._focusOnDialog();
      this._updateScrollableClass();
    }
  }

  public ngOnDestroy(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    if (this._windowResizeListener) {
      window.removeEventListener('resize', this._windowResizeListener);
    }
  }

  public repaint(): void {
    this._cdr.detectChanges();
  }

  public open(): void {
    this._attachDialogToBody();
    this.isVisible.set(true);

    setTimeout(() => {
      this._updatePosition();
      this._updateDialogWidth();
    }, 0);
  }

  public close(): void {
    this.isVisible.set(false);
    this.closed.emit();
    this._detachDialogFromBody();
  }

  public submit(): void {
    if (this._dialogRef.instance) {
      this._dialogRef.submit();
      return;
    }
    this.submitted.emit();
  }

  public cancel(): void {
    this.canceled.emit();
  }

  public action(): void {
    if (this._dialogRef.instance) {
      this._dialogRef.additionalAction();
      return;
    }
    this.additionalAction.emit();
  }

  public return(): void {
    if (this._dialogRef.instance) {
      this._dialogRef.return();
      return;
    }
    this.returned.emit();
  }

  protected onBackdropClick(): void {
    if (this.hideOnOutsideClick) {
      this.close();
    }
  }

  protected getPositionStyles(): Record<string, string> {
    const isMobile = window.innerWidth <= 768;
    let width: number;

    if (isMobile) {
      width = window.innerWidth <= 480 ? window.innerWidth * 0.95 : window.innerWidth * 0.93;
    } else {
      width = parseInt(this.getDialogWidth, 10);
    }

    const height = this.dialogContainer?.nativeElement.offsetHeight || window.innerHeight * 0.95;

    if (typeof this.position === 'object' && this.position !== null) {
      const customStyles: Record<string, string> = {};
      Object.entries(this.position).forEach(([key, value]) => {
        if (['top', 'bottom', 'left', 'right'].includes(key)) {
          customStyles[key] = value as string;
        }
      });
      return customStyles;
    }

    const predefinedStyles: Record<string, Record<string, string>> = {
      top: {
        top: '2%',
        left: isMobile ? '50%' : `calc(50vw - ${width / 2}px)`,
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      bottom: {
        bottom: '2%',
        left: isMobile ? '50%' : `calc(50vw - ${width / 2}px)`,
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      left: {
        top: `calc(50vh - ${height / 2}px)`,
        left: isMobile ? '50%' : '2%',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      right: {
        top: `calc(50vh - ${height / 2}px)`,
        right: isMobile ? 'unset' : '2%',
        left: isMobile ? '50%' : 'unset',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      'bottom-right': {
        bottom: '5%',
        right: isMobile ? 'unset' : '2%',
        left: isMobile ? '50%' : 'unset',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      'bottom-left': {
        bottom: '2%',
        left: isMobile ? '50%' : '2%',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      'top-right': {
        top: '2%',
        right: isMobile ? 'unset' : '2%',
        left: isMobile ? '50%' : 'unset',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      'top-left': {
        top: '2%',
        left: isMobile ? '50%' : '2%',
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
      center: {
        top: `calc(50vh - ${height / 2}px)`,
        left: isMobile ? '50%' : `calc(50vw - ${width / 2}px)`,
        ...(isMobile && { transform: 'translateX(-50%)' }),
      },
    };

    return (
      predefinedStyles[this.position as keyof typeof predefinedStyles] || predefinedStyles['center']
    );
  }

  private _focusOnDialog(): void {
    if (this.dialogContainer && this.dialogContainer.nativeElement) {
      this.dialogContainer.nativeElement.focus();
    }
  }

  private _updatePosition(): void {
    const positionStyles = this.getPositionStyles();

    const stylesToClear = ['top', 'bottom', 'left', 'right', 'transform'];
    stylesToClear.forEach((styleKey) => {
      this._renderer.removeStyle(this.dialogContainer?.nativeElement, styleKey);
    });

    Object.keys(positionStyles).forEach((styleKey) => {
      this._renderer.setStyle(
        this.dialogContainer?.nativeElement,
        styleKey,
        positionStyles[styleKey],
      );
    });
  }

  private _updateDialogWidth(): void {
    if (this.dialogContainer?.nativeElement) {
      this._renderer.setStyle(this.dialogContainer.nativeElement, 'width', this.getDialogWidth);
    }
  }

  private _updateScrollableClass(): void {
    if (this.modalContent?.nativeElement && this.dialogContainer?.nativeElement) {
      const contentHeight = this.modalContent.nativeElement.scrollHeight;
      if (contentHeight > window.innerHeight * 0.7) {
        this.dialogContainer.nativeElement.classList.add('scrollable');
      } else {
        this.dialogContainer.nativeElement.classList.remove('scrollable');
      }
    }
  }

  private _attachDialogToBody(): void {
    const body = this._renderer.selectRootElement('body', true);
    this._embeddedView = this._vcr.createEmbeddedView(this.dialogTemplate);
    this._embeddedView.rootNodes.forEach((node) => {
      this._renderer.appendChild(body, node);
    });
  }

  private _detachDialogFromBody(): void {
    const body = this._renderer.selectRootElement('body', true);
    if (this._embeddedView) {
      this._embeddedView.rootNodes.forEach((node) => {
        this._renderer.removeChild(body, node);
      });
      this._vcr.clear();
      this._embeddedView.destroy();
      this._embeddedView = null;
    }
  }

  @HostListener('document:keydown', ['$event'])
  protected handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape) {
      this.close();
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected handleKeyboardNavigation(event: KeyboardEvent) {
    if (!this.enableKeyboardNavigation || !this.isVisible()) {
      return;
    }

    switch (event.key) {
      case 'Enter':
        this.activeButton === 'submit' ? this.submit() : this.cancel();
        break;
      case 'ArrowLeft':
        this.activeButton = 'cancel';
        break;
      case 'ArrowRight':
        this.activeButton = 'submit';
        break;
      default:
        break;
    }
  }
}
