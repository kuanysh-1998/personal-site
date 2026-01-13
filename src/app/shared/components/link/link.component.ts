import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ng-link',
  imports: [RouterLink],
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
  @Input() public state: { [p: string]: any } | undefined = undefined;

  @Input() public variant: 'default' | 'secondary' = 'default';

  @HostBinding('class.ng-link') protected hostClass = true;

  @HostBinding(`class.ng-link__secondary`)
  protected get class(): boolean {
    return this.variant !== 'default';
  }

  @HostBinding(`class.ng-link__disabled`)
  protected get isDisabled(): boolean {
    return this.disabled;
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
