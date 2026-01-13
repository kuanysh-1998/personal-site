// import { CommonModule } from '@angular/common';
// import {
//   ChangeDetectionStrategy,
//   Component,
//   HostBinding,
//   Input,
//   OnInit,
//   ViewEncapsulation,
// } from '@angular/core';

// import { LinkComponent } from '../link/link.component';
// import { Link } from '../link/link.types';
// import { SvgComponent } from '../svg/svg.component';
// import { WkIcons } from '../svg/svg.config';
// import { TooltipDirective } from '../tooltip/tooltip.directive';
// import { LibConfig } from '../../lib-config/lib-config';

// @Component({
//   selector: 'wk-label',
//   imports: [CommonModule, SvgComponent, LinkComponent, TooltipDirective],
//   templateUrl: './label.component.html',
//   styleUrls: ['./label.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   encapsulation: ViewEncapsulation.None,
// })
// export class LabelComponent implements OnInit {
//   @Input() public label = LibConfig.defaultSettings.label.label;
//   @Input() public info = LibConfig.defaultSettings.label.info;
//   @Input() public bold = LibConfig.defaultSettings.label.bold;
//   @Input() public required = LibConfig.defaultSettings.label.required;
//   @Input() public disabled = LibConfig.defaultSettings.label.disabled;
//   @Input() public for = LibConfig.defaultSettings.label.for;
//   @Input() public size = LibConfig.defaultSettings.label.size;
//   @Input() public links = LibConfig.defaultSettings.label.links;
//   @Input() public stylingMode = LibConfig.defaultSettings.label.stylingMode;

//   public readonly icon = WkIcons;
//   public secondaryTextParts: (string | Link)[];

//   @HostBinding('class.wk-label') protected hostClass = true;

//   public get labelClasses(): Record<string, boolean> {
//     return {
//       'wk-label__container': true,
//       [`wk-label__container_${this.stylingMode}`]: true,
//       'wk-label__bold': this.bold,
//       [`wk-label__${this.size}`]: true,
//       'wk-label__disabled': this.disabled,
//     };
//   }

//   public ngOnInit(): void {
//     this.secondaryTextParts = this._parseMessage(this.label);
//   }

//   public isLink(part: string | Link): boolean {
//     return typeof part !== 'string';
//   }

//   public getText(part: Link | string): string {
//     return typeof part !== 'string' ? part.text : part;
//   }

//   public getIsDownload(part: Link | string): string | undefined {
//     return typeof part !== 'string' ? part.download : undefined;
//   }

//   public getUrl(part: Link | string): string {
//     return typeof part !== 'string' ? part.url : part;
//   }

//   private _parseMessage(message: string): (string | Link)[] {
//     const placeholderRegex = /\{\{|}}/;
//     const parts = message.split(placeholderRegex);
//     return parts.filter(Boolean).map((i) => (this.links?.[i] ? this.links[i] : i));
//   }
// }
