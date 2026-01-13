import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ToastType } from './toast.types';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  selector: 'ng-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [CommonModule, SvgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  @Input() public type: ToastType = ToastType.Success;
  @Input() public header = '';
  @Input() public message = '';

  @Output() public closed: EventEmitter<void> = new EventEmitter<void>();

  protected readonly iconClose: string = Icons.Cross;

  private readonly _icons: Record<ToastType, string> = {
    [ToastType.Success]: Icons.Success,
    [ToastType.Info]: Icons.Info,
    [ToastType.Error]: Icons.Error,
    [ToastType.Warning]: Icons.Warning,
  };

  protected get iconForType(): string {
    return this._icons[this.type];
  }

  public onClose(): void {
    this.closed.emit();
  }

  protected getToastClasses(): { [key: string]: boolean } {
    return {
      'ng-toast__toast_type-success': this.type === ToastType.Success,
      'ng-toast__toast_type-error': this.type === ToastType.Error,
      'ng-toast__toast_type-info': this.type === ToastType.Info,
      'ng-toast__toast_type-warning': this.type === ToastType.Warning,
    };
  }
}
