import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Overlay } from '../../utils/overlay';

@Component({
  selector: 'ng-popover',
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent extends Overlay implements AfterViewInit, OnDestroy {
  @Input()
  public set for(value: Element | string | number | undefined) {
    this._for = value ?? '';
    this._initTargetElement();
  }

  public get for(): Element | string | number | undefined {
    return this._for;
  }

  @Input() public template: TemplateRef<any> | undefined = undefined;
  @Input() public externalClass = '';

  @Input() public minWidth: number | undefined = undefined;
  @Input() public height = undefined;
  @Input() public maxHeight = undefined;
  @Input() public padding = 'default';

  @Input() public hideOnOutsideClick: boolean | ((event: MouseEvent) => boolean) = true;

  @Input()
  public set isOpen(value: boolean) {
    if (this._isOpen() !== value) {
      this._isOpen.set(value);

      if (value) {
        this._checkVisibilityAndOpen();
      } else {
        this.close();
      }
    }
  }

  @Output() public opened = new EventEmitter<void>();
  @Output() public closed = new EventEmitter<void>();

  @ViewChild('popoverContainer')
  private readonly _popoverContainer: TemplateRef<any> | undefined = undefined;

  private _for: Element | string | number | undefined = undefined;
  private readonly _isOpen = signal(false);
  private _documentClickListener: any;
  private _intersectionObserver: IntersectionObserver | null = null;

  public get isOpen(): boolean {
    return this._isOpen();
  }

  constructor(
    public override readonly renderer: Renderer2,
    public override readonly vcr: ViewContainerRef
  ) {
    super(renderer, vcr);
  }

  public ngAfterViewInit(): void {
    this._initTargetElement();
    if (this.isOpen) this._checkVisibilityAndOpen();
  }

  public ngOnDestroy(): void {
    this.close();
  }

  public open(): void {
    this._isOpen.set(true);
    if (!this.targetElement) return;

    this._initPopover();
    requestAnimationFrame(() => {
      this.setPosition();
    });

    this._documentClickListener = this._onDocumentClick.bind(this);
    document.addEventListener('mousedown', this._documentClickListener, true);
    this.addScrollListeners();
    this.opened.emit();
  }

  public close(): void {
    this._isOpen.set(false);

    if (this.popoverElement) {
      this.renderer.removeChild(document.body, this.popoverElement);
      this.popoverElement = undefined;
      this.closed.emit();
    }

    if (this._documentClickListener) {
      document.removeEventListener('mousedown', this._documentClickListener, true);
      this._documentClickListener = null;
    }

    this.removeScrollListeners();

    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:resize')
  protected resize(): void {
    if (!this.isOpen) return;
    this.setPosition();
  }

  private _initTargetElement(): void {
    if (typeof this.for === 'string') {
      this.targetElement = document.querySelector(`#${this.for}`) as HTMLElement;
    } else if (this.for instanceof Element) {
      this.targetElement = this.for as HTMLElement;
    } else {
      this.targetElement = document.getElementById(this.for?.toString() ?? '') as HTMLElement;
    }
  }

  private _initPopover(): void {
    const body = document.body;
    this.popoverElement = this.renderer.createElement('div');

    const classes = ['ng-popover', ...this.externalClass.split(' ')];

    classes.forEach((className) => {
      if (className) {
        this.renderer.addClass(this.popoverElement, className);
      }
    });

    if (this.minWidth) {
      this.renderer.setStyle(this.popoverElement, 'min-width', `${this.minWidth}px`);
    }

    if (this.isInsideDialogOrDrawer()) {
      this.renderer.setStyle(this.popoverElement, 'z-index', '2000');
    } else {
      this.renderer.setStyle(this.popoverElement, 'z-index', '100');
    }

    this.renderer.appendChild(body, this.popoverElement);

    const viewRef = this.vcr.createEmbeddedView(this._popoverContainer as TemplateRef<any>);
    viewRef.rootNodes.forEach((node) => this.renderer.appendChild(this.popoverElement, node));
  }

  private _onDocumentClick(event: MouseEvent): void {
    const clickedInsidePopover = this.popoverElement?.contains(event.target as Node);
    const clickedOnTarget = this.targetElement?.contains(event.target as Node);

    let shouldClose = false;

    if (typeof this.hideOnOutsideClick === 'boolean') {
      shouldClose = this.hideOnOutsideClick;
    } else if (typeof this.hideOnOutsideClick === 'function') {
      shouldClose = this.hideOnOutsideClick(event);
    }

    if (!clickedInsidePopover && !clickedOnTarget && shouldClose) {
      this.close();
    }
  }

  private _checkVisibilityAndOpen(): void {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }

    this._intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.open();
        } else {
          this.close();
        }
      });
    });

    if (this.targetElement) {
      this._intersectionObserver.observe(this.targetElement);
    }
  }
}
