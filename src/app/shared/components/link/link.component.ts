import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SvgComponent } from '@app/shared/components/svg/svg.component';
import { IconSize } from '@app/shared/components/svg/svg.config';

@Component({
  selector: 'app-link',
  imports: [RouterLink, NgTemplateOutlet, SvgComponent],
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  @Input() public link: string | undefined = undefined;
  @Input() public text: string | undefined = undefined;
  @Input() public disabled = false;
  @Input() public isPdf = false;
  @Input() public download: string | undefined = undefined;
  @Input() public state: Record<string, any> | undefined = undefined;

  @Input() public icon: string | undefined = undefined;
  @Input() public iconSize: IconSize = 'small';

  @Input() public variant: 'default' | 'secondary' = 'default';
  @Input() public underlineOnHover = false;

  @HostBinding('class.ng-link') protected hostClass = true;

  @HostBinding(`class.ng-link__secondary`)
  protected get class(): boolean {
    return this.variant !== 'default';
  }

  @HostBinding(`class.ng-link__disabled`)
  protected get isDisabled(): boolean {
    return this.disabled;
  }

  @HostBinding(`class.ng-link__underline-on-hover`)
  protected get underlineOnHoverClass(): boolean {
    return this.underlineOnHover;
  }

  public isExternalLink(url: string | undefined): boolean {
    if (!url) {
      return false;
    }
    return (
      url.startsWith('http') ||
      url.startsWith('https') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('sms:')
    );
  }
}
