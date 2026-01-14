import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'ng-divider',
  imports: [CommonModule, SvgComponent],
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {
  @Input() public margin = 'small';
  @Input() public position = 'left';
  @Input() public labelBold = false;
  @Input() public icon = undefined;
  @Input() public text = undefined;

  public get isLeftContent(): boolean {
    return this.position === 'left' && (!!this.icon || !!this.text);
  }

  public get isCenterContent(): boolean {
    return this.position === 'center' && (!!this.icon || !!this.text);
  }

  public get isRightContent(): boolean {
    return this.position === 'right' && (!!this.icon || !!this.text);
  }

  public get dividerClasses(): string {
    return `ng-divider ng-divider__${this.margin}`;
  }
}
