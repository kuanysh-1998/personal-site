import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'ng-card',
  imports: [CommonModule, SvgComponent],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() public padding = 'large';
  @Input() public direction = 'vertical';
  @Input() public enableExpand = false;
  @Input() public clickable = false;
  @Input() public header = '';
  @Input() public stylingMode = 'default';
  @Input() public fullHeight = false;

  @Input() public templateHeader = undefined;

  @Input() public icon: string | undefined = undefined;
  @Input() public iconRight: string | undefined = undefined;
  @Input() public token = undefined;
  @Input() public hideDivider = false;

  @Input()
  public get isExpanded(): boolean {
    return this.isExpandedSignal();
  }

  public set isExpanded(value: boolean) {
    this.isExpandedSignal.set(value);
  }

  @Output() public clicked = new EventEmitter<void>();

  @ViewChild('card') public card!: ElementRef<HTMLDivElement>;

  protected isExpandedSignal = signal(true);

  protected get isFullHeight(): boolean {
    return this.fullHeight;
  }

  protected get isClickableHeader(): boolean {
    return this.enableExpand && this.direction === 'vertical' && !this.clickable;
  }

  protected get cardClasses(): Record<string, boolean> {
    return {
      'ng-card__container': true,
      [`ng-card__container_${this.direction}`]: true,
      [`ng-card__container_${this.padding}`]: true,
      [`ng-card__container_${this.stylingMode}`]: true,
      ['ng-card__container_clickable']: this.clickable,
      'ng-card__container_full-height': this.fullHeight,
    };
  }

  protected get headerClasses(): Record<string, boolean> {
    return {
      'ng-card__header-wrapper': true,
      'ng-card__header-wrapper_clickable': this.isClickableHeader,
      'ng-card__header-wrapper_open': this.isExpandedSignal(),
    };
  }

  protected get contentClasses(): Record<string, boolean> {
    const hasHeader =
      !!this.header || !!this.icon || !!this.templateHeader || this.isClickableHeader;
    return {
      'ng-card__content': true,
      [`ng-card__content_${this.direction}`]: true,
      [`ng-card__content_${this.padding}`]: true,
      'ng-card__content_with-header': hasHeader && !this.hideDivider,
    };
  }

  public toggleContent(): void {
    if (!this.isClickableHeader) return;
    this.isExpandedSignal.set(!this.isExpandedSignal());
  }

  public open(): void {
    if (!this.isClickableHeader) return;
    this.isExpandedSignal.set(true);
  }

  public close(): void {
    if (!this.isClickableHeader) return;
    this.isExpandedSignal.set(false);
  }

  protected click(): void {
    if (!this.clickable) return;
    this.clicked.emit();
  }
}
