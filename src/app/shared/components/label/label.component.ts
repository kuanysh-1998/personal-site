import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from '@angular/core';

import { LinkComponent } from '../link/link.component';
import { Link } from '../link/link.types';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  selector: 'ng-label',
  imports: [CommonModule, SvgComponent, LinkComponent, TooltipDirective],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent implements OnInit {
  @Input() public label = '';
  @Input() public info: string | TemplateRef<unknown> = '';
  @Input() public bold = false;
  @Input() public required = false;
  @Input() public disabled = false;
  @Input() public for = undefined;
  @Input() public size = 'm';
  @Input() public links = undefined;

  public readonly icon = Icons;
  public secondaryTextParts: (string | Link)[] = [];

  public get labelClasses(): Record<string, boolean> {
    return {
      'ng-label__container': true,
      'ng-label__bold': this.bold,
      [`ng-label__${this.size}`]: true,
      'ng-label__disabled': this.disabled,
    };
  }

  public ngOnInit(): void {
    this.secondaryTextParts = this._parseMessage(this.label);
  }

  public isLink(part: string | Link): boolean {
    return typeof part !== 'string';
  }

  public getText(part: Link | string): string {
    return typeof part !== 'string' ? part.text : part;
  }

  public getIsDownload(part: Link | string): string | undefined {
    return typeof part !== 'string' ? part.download : undefined;
  }

  public getUrl(part: Link | string): string {
    return typeof part !== 'string' ? part.url : part;
  }

  private _parseMessage(message: string): (string | Link)[] {
    const placeholderRegex = /\{\{|}}/;
    const parts = message.split(placeholderRegex);
    return parts.filter(Boolean).map((i) => (this.links?.[i] ? this.links[i] : i));
  }
}
