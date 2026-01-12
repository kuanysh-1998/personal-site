import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ICON_DEFAULT_SIZE, Icons, IconSize } from './svg.config';

@Component({
  selector: 'ng-svg',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgComponent {
  @Input() icon?: Icons | string;

  @Input() basePath = 'assets/image';

  @Input() size: IconSize = 'default';
  @Input() color?: string;
  @Input() token?: string;

  @Input() width?: string;
  @Input() height?: string;

  @Input() wrapperWidth?: string;
  @Input() wrapperHeight?: string;

  @Input() ariaLabel?: string;
  @HostBinding('attr.role') role = 'img';
  @HostBinding('attr.aria-hidden') get ariaHidden() {
    return this.ariaLabel ? null : 'true';
  }
  @HostBinding('attr.aria-label') get ariaLabelAttr() {
    return this.ariaLabel ?? null;
  }

  public defaultIcons: Partial<Record<Icons, TemplateRef<unknown>>> = {};

  public get svgFillColor() {
    return this.color ?? 'currentColor';
  }

  public get svgStyle() {
    const baseStyle: Record<string, string> = {
      width: this.iconWidth,
      height: this.iconHeight,
    };

    if (this.color) {
      baseStyle['fill'] = this.color;
    }

    return baseStyle;
  }

  private get _resolvedWidth(): string {
    return this.width ?? ICON_DEFAULT_SIZE[this.size].width;
  }
  private get _resolvedHeight(): string {
    return this.height ?? ICON_DEFAULT_SIZE[this.size].height;
  }

  @HostBinding('style.width') get hostWidth() {
    return this.wrapperWidth ?? this._resolvedWidth;
  }
  @HostBinding('style.height') get hostHeight() {
    return this.wrapperHeight ?? this._resolvedHeight;
  }
  @HostBinding('style.color') get hostColor() {
    return this.color ?? null;
  }

  public get defaultIcon(): TemplateRef<unknown> | null {
    if (!this.icon) return null;
    return this.defaultIcons[this.icon as Icons] ?? null;
  }

  public get iconWidth() {
    return this._resolvedWidth;
  }
  public get iconHeight() {
    return this._resolvedHeight;
  }

  private get iconName(): string | null {
    return this.icon ? String(this.icon) : null;
  }

  public get isSvg(): boolean {
    const src = this.iconSrc;
    if (!src) return false;
    return /\.svg($|\?)/i.test(src);
  }

  public get iconSrc(): string | null {
    const name = this.iconName;
    if (!name) return null;
    const hasExt = /\.[a-z0-9]+$/i.test(name);
    const file = hasExt ? name : `${name}.svg`;
    return `${this.basePath}/${file}`;
  }
}
