import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { SvgComponent } from '../svg/svg.component';
import { ButtonSize, ButtonVariant, StylingMode } from './button.types';

@Component({
  selector: 'ng-button',
  imports: [CommonModule, SvgComponent],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() public label = '';
  @Input() public stylingMode: StylingMode = 'ghost';
  @Input() public variant: ButtonVariant = 'default';
  @Input() public size: ButtonSize = 'default';
  @Input() public fullWidth = false;
  @Input() public fullHeight = false;
  @Input() public disabled = false;
  @Input() public active = false;
  @Input() public icon?: string;
  @Input() public rightIcon?: string;
  @Input() public iconWidth?: string;
  @Input() public iconHeight?: string;
  @Input() public ariaLabel?: string;

  @Output() public clicked = new EventEmitter<PointerEvent | MouseEvent>();

  @HostBinding('style.width')
  protected get widthStyle(): string | null {
    return this.fullWidth ? '100%' : null;
  }

  protected get isIconButton(): boolean {
    return !this.label && (!!this.icon || !!this.rightIcon);
  }

  protected get buttonClasses(): Record<string, boolean> {
    return {
      [`ng-button__container_${this.stylingMode}`]: true,
      [`ng-button__container_${this.variant}`]: this.variant !== 'default',
      [`ng-button__container_size-${this.size}`]: true,
      'ng-button__container_full-width': this.fullWidth,
      'ng-button__container_full-height': this.fullHeight,
      'ng-button__container_icon-button': this.isIconButton,
      'ng-button__container_disabled': this.disabled,
      'ng-button__container_active': this.active,
    };
  }

  protected click(event: PointerEvent | MouseEvent): void {
    if (this.disabled) return;
    this.clicked.emit(event);
  }
}
