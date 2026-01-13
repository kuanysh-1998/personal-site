import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay } from '@app/shared/utils/overlay';

@Component({
  selector: 'ng-tooltip',
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent extends Overlay implements AfterViewInit, OnDestroy {
  @Input() public content: string | number | TemplateRef<unknown> | undefined = undefined;
  @Input() public for: Element | string | number | undefined = undefined;
  @Input() public manualControl = false;
  @Input() public shakeAnimation = false;
  @Input() public maxWidth = 340;

  @Input()
  public set isOpen(value: boolean) {
    this._isOpen.set(value);
  }

  @Input() public onHover = true;
  @Input() public override offset = 8;
  @Input() public hideOnOutsideClick: boolean | ((event: MouseEvent) => boolean) = true;

  private readonly _isOpen = signal(false);
  private readonly _unsubscriber$$ = new Subject<void>();

  private _isVisible = false;
  private _intersectionObserver: IntersectionObserver | null = null;
  private _documentClickListener: any;

  @ViewChild('popoverContainer')
  private readonly _popoverContainer: TemplateRef<unknown> | undefined = undefined;

  public get isOpen(): boolean {
    return this._isOpen();
  }

  protected get template(): TemplateRef<unknown> | null {
    if (
      typeof this.content === 'string' ||
      typeof this.content === 'number' ||
      this.content === undefined
    ) {
      return null;
    }
    // После всех проверок content может быть только TemplateRef<unknown>
    return this.content as TemplateRef<unknown>;
  }

  protected get stringContent(): string | null {
    if (typeof this.content === 'string') return this.content.trim();
    return null;
  }

  constructor(
    public override readonly renderer: Renderer2,
    public override readonly vcr: ViewContainerRef,
    private readonly _destroyRef: DestroyRef
  ) {
    super(renderer, vcr);

    effect(() => {
      if (this._isOpen()) {
        this.open();
      } else {
        this.close();
      }
    });
  }

  public ngAfterViewInit(): void {
    this._initTargetElement();
    this._initSubs();
    if (this.isOpen) this._checkVisibilityAndOpen();
  }

  public ngOnDestroy(): void {
    this.close();
    this._unsubscribeTooltipSubs();
  }

  public toggle(): void {
    this._isOpen.set(!this._isOpen());
  }

  @HostListener('window:resize')
  protected resize(): void {
    if (!this.isOpen) return;
    this.setPosition();
  }

  protected open(): void {
    if (this._isVisible) return;

    this._isVisible = true;
    if (!this.targetElement) return;

    this._initTooltip();
    requestAnimationFrame(() => {
      this.setPosition();
    });

    this._documentClickListener = this._onDocumentClick.bind(this);
    document.addEventListener('mousedown', this._documentClickListener, true);
    this.addScrollListeners();
  }

  protected close(): void {
    this._unsubscribeTooltipSubs();
    this._isVisible = false;

    if (this.popoverElement) {
      this.renderer.removeChild(document.body, this.popoverElement);
      this.popoverElement = undefined;
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

  private _initTargetElement(): void {
    if (typeof this.for === 'string') {
      this.targetElement = document.querySelector(`#${this.for}`) as HTMLElement;
    } else if (this.for instanceof Element) {
      this.targetElement = this.for as HTMLElement;
    } else if (this.for !== undefined) {
      this.targetElement = document.getElementById(this.for.toString()) as HTMLElement;
    }
  }

  private _initTooltip(): void {
    const body = document.body;
    this.popoverElement = this.renderer.createElement('div');

    this.renderer.addClass(this.popoverElement, 'ng-tooltip');

    if (this.shakeAnimation && this.popoverElement) {
      if (this.position.startsWith('top') || this.position.startsWith('bottom')) {
        this.renderer.addClass(this.popoverElement, 'ng-tooltip_shake-vertical');
      }

      if (this.position.startsWith('right') || this.position.startsWith('left')) {
        this.renderer.addClass(this.popoverElement, 'ng-tooltip_shake-horizontal');
      }

      fromEvent(this.popoverElement, 'mouseenter', () => {
        if (!this.popoverElement) return;
        this.renderer.removeClass(this.popoverElement, 'ng-tooltip_shake-horizontal');
        this.renderer.removeClass(this.popoverElement, 'ng-tooltip_shake-vertical');
      })
        .pipe(takeUntil(this._unsubscriber$$))
        .subscribe();

      fromEvent(this.popoverElement, 'mouseleave', () => {
        if (this.position.startsWith('top') || this.position.startsWith('bottom')) {
          this.renderer.addClass(this.popoverElement, 'ng-tooltip_shake-vertical');
        }

        if (this.position.startsWith('right') || this.position.startsWith('left')) {
          this.renderer.addClass(this.popoverElement, 'ng-tooltip_shake-horizontal');
        }
      })
        .pipe(takeUntil(this._unsubscriber$$))
        .subscribe();
    }

    if (this.isInsideDialogOrDrawer()) {
      this.renderer.setStyle(this.popoverElement, 'z-index', '1000001');
    } else {
      this.renderer.setStyle(this.popoverElement, 'z-index', '1000001');
    }

    this.renderer.appendChild(body, this.popoverElement);

    const arrow = this.renderer.createElement('div');
    this.renderer.addClass(arrow, 'ng-tooltip__arrow');
    this.renderer.appendChild(this.popoverElement, arrow);

    const viewRef = this.vcr.createEmbeddedView(this._popoverContainer as TemplateRef<unknown>);
    viewRef.detectChanges();
    viewRef.rootNodes.forEach((node) => this.renderer.appendChild(this.popoverElement, node));
  }

  private _initSubs(): void {
    if (this.targetElement && !this.manualControl) {
      fromEvent(this.targetElement, 'mouseenter', () => this.open())
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();

      fromEvent(this.targetElement, 'mouseleave', () => this.close())
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();
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

  private _unsubscribeTooltipSubs(): void {
    this._unsubscriber$$.next();
    this._unsubscriber$$.complete();
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
      this._isOpen.set(false);
    }
  }
}
