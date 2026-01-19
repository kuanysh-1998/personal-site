import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ng-scroll',
  templateUrl: './scroll.component.html',
  styleUrls: ['./scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollComponent implements AfterViewInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);
  @Input() public tolerance = 2;
  @Input() public thickness = 6;

  @Output()
  public scrollEndVertical = new EventEmitter<void>();

  @Output() public scrollEndHorizontal = new EventEmitter<void>();

  @ViewChild('content')
  private readonly _contentRef?: ElementRef<HTMLDivElement>;
  @ViewChild('scrollbar') private readonly _verticalScrollbarRef?: ElementRef;
  @ViewChild('hScrollbar')
  private readonly _horizontalScrollbarRef?: ElementRef;

  private _draggingVertical = false;
  private _draggingHorizontal = false;

  private _startY = 0;
  private _startX = 0;
  private _startScrollTop = 0;
  private _startScrollLeft = 0;

  private _lastScrollTop = 0;
  private _lastScrollLeft = 0;

  private _isAtBottomEmitted = false;
  private _isAtRightEmitted = false;

  private _resizeObserver?: ResizeObserver;
  private _mutationObserver?: MutationObserver;

  constructor(private readonly _renderer: Renderer2) {}

  public ngAfterViewInit(): void {
    this._updateVerticalScrollbar();
    this._updateHorizontalScrollbar();
    this._subscribeToScrollEvents();

    if (this._contentRef) {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateVerticalScrollbar();
        this._updateHorizontalScrollbar();
      });

      this._mutationObserver = new MutationObserver(() => {
        this._updateVerticalScrollbar();
        this._updateHorizontalScrollbar();
      });

      this._resizeObserver.observe(this._contentRef.nativeElement);
      this._mutationObserver.observe(this._contentRef.nativeElement, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  }

  public updateScrollbars(): void {
    requestAnimationFrame(() => {
      this._updateVerticalScrollbar();
      this._updateHorizontalScrollbar();
      requestAnimationFrame(() => {
        this._updateVerticalScrollbar();
        this._updateHorizontalScrollbar();
      });
    });
  }

  public ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._mutationObserver?.disconnect();
  }

  protected handleVerticalMousedown(event: MouseEvent): void {
    event.preventDefault();

    const initialScroll = 0;

    this._draggingVertical = true;
    this._startY = event.clientY;
    this._startScrollTop = this._contentRef?.nativeElement.scrollTop || initialScroll;

    const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
      finalize(() => {
        this._draggingVertical = false;
      }),
    );

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntil(mouseUp$), takeUntilDestroyed(this._destroyRef))
      .subscribe(this._updateVerticalScroll.bind(this));
  }

  protected handleHorizontalMousedown(event: MouseEvent): void {
    event.preventDefault();

    this._draggingHorizontal = true;
    this._startX = event.clientX;
    this._startScrollLeft = this._contentRef?.nativeElement.scrollLeft || 0;

    const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
      finalize(() => {
        this._draggingHorizontal = false;
      }),
    );

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntil(mouseUp$), takeUntilDestroyed(this._destroyRef))
      .subscribe(this._updateHorizontalScroll.bind(this));
  }

  private _subscribeToScrollEvents(): void {
    fromEvent(this._contentRef?.nativeElement as HTMLDivElement, 'scroll')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._updateVerticalScrollbarPosition();
        this._updateHorizontalScrollbarPosition();
        this._checkScrollEnd();
      });
  }

  private _updateVerticalScrollbar(): void {
    this._adjustScrollbar(
      this._contentRef,
      this._verticalScrollbarRef,
      'clientHeight',
      'scrollHeight',
      'height',
    );
  }

  private _updateHorizontalScrollbar(): void {
    this._adjustScrollbar(
      this._contentRef,
      this._horizontalScrollbarRef,
      'clientWidth',
      'scrollWidth',
      'width',
    );
  }

  private _adjustScrollbar(
    content: ElementRef | undefined,
    scrollbar: ElementRef | undefined,
    clientProp: string,
    scrollProp: string,
    cssProp: string,
  ): void {
    if (!content || !scrollbar) return;

    const containerSize = content.nativeElement[clientProp];
    const contentSize = content.nativeElement[scrollProp];

    const sizeRatio = containerSize / contentSize;
    const scrollbarSize = sizeRatio * containerSize;
    const minSize = 20;

    const shouldHide = contentSize <= containerSize;

    this._renderer.setStyle(
      scrollbar.nativeElement,
      cssProp,
      `${Math.max(scrollbarSize, minSize)}px`,
    );
    this._renderer.setStyle(scrollbar.nativeElement, 'display', shouldHide ? 'none' : 'block');
  }

  private _updateVerticalScroll(event: MouseEvent): void {
    if (!this._draggingVertical) return;

    const deltaY = event.clientY - this._startY;
    const percentage = deltaY / (this._contentRef?.nativeElement.clientHeight || 1);
    const deltaScroll = percentage * (this._contentRef?.nativeElement.scrollHeight || 1);

    if (!this._contentRef) return;
    this._contentRef.nativeElement.scrollTop = this._startScrollTop + deltaScroll;
  }

  private _updateHorizontalScroll(event: MouseEvent): void {
    if (!this._draggingHorizontal) return;

    const deltaX = event.clientX - this._startX;
    const percentage = deltaX / (this._contentRef?.nativeElement.clientWidth || 1);
    const deltaScroll = percentage * (this._contentRef?.nativeElement.scrollWidth || 1);

    if (!this._contentRef) return;
    this._contentRef.nativeElement.scrollLeft = this._startScrollLeft + deltaScroll;
  }

  private _updateVerticalScrollbarPosition(): void {
    this._moveScrollbar(
      this._contentRef,
      this._verticalScrollbarRef,
      'scrollTop',
      'clientHeight',
      'scrollHeight',
      'top',
    );
  }

  private _updateHorizontalScrollbarPosition(): void {
    this._moveScrollbar(
      this._contentRef,
      this._horizontalScrollbarRef,
      'scrollLeft',
      'clientWidth',
      'scrollWidth',
      'left',
    );
  }

  private _moveScrollbar(
    content: ElementRef | undefined,
    scrollbar: ElementRef | undefined,
    scrollProp: string,
    clientProp: string,
    scrollDimProp: string,
    cssProp: string,
  ): void {
    if (!content || !scrollbar) return;

    const scrolled = content.nativeElement[scrollProp];
    const maxScrolled = content.nativeElement[scrollDimProp] - content.nativeElement[clientProp];
    const scrollPercentage = scrolled / maxScrolled;
    const maxPos = content.nativeElement[clientProp] - scrollbar.nativeElement[clientProp];

    this._renderer.setStyle(scrollbar.nativeElement, cssProp, `${scrollPercentage * maxPos}px`);
  }

  private _checkScrollEnd(): void {
    if (!this._contentRef) return;

    const contentEl = this._contentRef.nativeElement;

    const canScrollVertically = contentEl.scrollHeight > contentEl.clientHeight;
    const canScrollHorizontally = contentEl.scrollWidth > contentEl.clientWidth;

    const isScrollingDown = contentEl.scrollTop > this._lastScrollTop;
    const isScrollingRight = contentEl.scrollLeft > this._lastScrollLeft;

    if (canScrollVertically && isScrollingDown) {
      const isAtBottom =
        contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - this.tolerance;

      if (isAtBottom && !this._isAtBottomEmitted) {
        this.scrollEndVertical.emit();
        this._isAtBottomEmitted = true;
      } else if (!isAtBottom) {
        this._isAtBottomEmitted = false;
      }
    }

    if (canScrollHorizontally && isScrollingRight) {
      const isAtRight =
        contentEl.scrollLeft + contentEl.clientWidth >= contentEl.scrollWidth - this.tolerance;

      if (isAtRight && !this._isAtRightEmitted) {
        this.scrollEndHorizontal.emit();
        this._isAtRightEmitted = true;
      } else if (!isAtRight) {
        this._isAtRightEmitted = false;
      }
    }

    this._lastScrollTop = contentEl.scrollTop;
    this._lastScrollLeft = contentEl.scrollLeft;
  }
}
