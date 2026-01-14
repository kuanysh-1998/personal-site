import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';
@Component({
  selector: 'ng-avatar',
  imports: [CommonModule, SvgComponent, NgOptimizedImage],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent implements OnInit {
  @Input() public name: string = '';
  @Input() public size: 'medium' | 'large' = 'medium';
  @Input() public variant: 'default' | 'secondary' | 'alternative' = 'default';

  @Input() public src: string | undefined = undefined;

  @HostBinding('class.ng-avatar') protected hostClass = true;

  protected readonly avatarIcon = Icons.Success;
  protected initials = '';

  protected get svgSize(): 'default' | 'large' {
    return this.size === 'medium' ? 'default' : 'large';
  }

  protected get avatarClasses(): Record<string, boolean> {
    return {
      'ng-avatar__circle': true,
      [`ng-avatar__circle_${this.size}`]: true,
      [`ng-avatar__circle_${this.variant}`]: true,
      [`ng-avatar__circle_image`]: !!this.src,
    };
  }

  public ngOnInit(): void {
    this.initials = this._getInitials();
  }

  private _getInitials(): string {
    const words = this.name.split(' ');

    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0);

    return words[0].charAt(0) + words[1].charAt(0);
  }
}
