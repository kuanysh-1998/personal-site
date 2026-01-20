import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';

import { TooltipComponent } from '../tooltip/tooltip.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'ng-badge',
  imports: [CommonModule, SvgComponent, TooltipComponent],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() public size = 'medium';
  @Input() public stylingMode = 'contained';
  @Input() public variant = 'default';
  @Input() public asIcon = false;
  @Input() public iconClickable = false;
  @Input() public iconRightClickable = false;
  @Input() public enableTooltip = true;
  @Input() public tooltipPosition = 'top';
  @Input() public text = '';

  @Input() public icon = undefined;
  @Input() public iconRight = undefined;
  @Input() public token = undefined;
  @Input() public url: string | undefined = undefined;

  @Output() public clickedIcon = new EventEmitter<void>();
  @Output() public clickedIconRight = new EventEmitter<void>();

  protected isOverflowing = signal(false);

  private _resizeObserver: ResizeObserver | null = null;

  @ViewChild('badgeText', { static: false })
  private readonly _badgeText?: ElementRef<HTMLSpanElement>;

  @ViewChild('badgeWrapper', { static: false })
  protected readonly badgeWrapper!: ElementRef<HTMLElement>;

  protected get badgeClasses(): Record<string, boolean> {
    return {
      ['ng-badge__container']: true,
      [`ng-badge__container_${this.size}`]: true,
      [`ng-badge__container_${this.stylingMode}`]: true,
      [`ng-badge__container_${this.variant}`]: true,
      ['ng-badge__container_with-icon']: !!this.icon,
      ['ng-badge__container_with-icon-right']: !!this.iconRight,
      ['ng-badge__container_is-icon']: this.asIcon,
      ['ng-badge__container_only-icon']:
        ((!this.text && !!this.icon) || (!!this.iconRight && !this.text)) &&
        !(this.icon && this.iconRight),
      ['ng-badge__container_clickable']: !!this.url,
    };
  }

  constructor(private readonly _elRef: ElementRef) {}

  public ngOnInit(): void {
    this.isOverflowing.set(this.enableTooltip);
  }

  public ngAfterViewInit(): void {
    if (!this.enableTooltip) return;
    this._checkOverflow();
    this._initTooltipSub();
  }

  public ngOnDestroy(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  protected clickIcon(): void {
    if (!this.iconClickable) return;
    this.clickedIcon.emit();
  }

  protected clickIconRight(): void {
    if (!this.iconRightClickable) return;
    this.clickedIconRight.emit();
  }

  private _initTooltipSub(): void {
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
    this._resizeObserver.observe(this._elRef.nativeElement);
  }

  private _checkOverflow(): void {
    if (!this._badgeText?.nativeElement) return;

    const badgeElement = this._elRef.nativeElement;
    const textElement = this._badgeText.nativeElement;

    this.isOverflowing.set(textElement.offsetHeight > badgeElement.offsetHeight);
  }
}
