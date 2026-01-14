import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';
import { SpinnerSize } from './spinner.types';

@Component({
  selector: 'ng-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  imports: [SvgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() public size: SpinnerSize = 'default';
  @Input() public fullScreen = false;

  protected readonly icon = Icons.Spinner;
  protected readonly mapSize: Record<SpinnerSize, string> = {
    small: '24px',
    default: '36px',
    large: '56px',
  };
}
