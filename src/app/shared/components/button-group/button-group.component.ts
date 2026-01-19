import { ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ng-button-group',
  imports: [],
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  @HostBinding('class.ng-button-group') public hostClass = true;
}
