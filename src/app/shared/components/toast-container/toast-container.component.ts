import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostBinding,
  Injector,
  Input,
  runInInjectionContext,
  signal,
} from '@angular/core';

import { ToastComponent } from '../toast/toast.component';
import { Message, ToastType } from '../toast/toast.types';
import { ToastService } from './toast.service';

@Component({
  selector: 'ng-toast-container',
  templateUrl: './toast-container.component.html',
  imports: [ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent {
  @Input() public life = 3000;

  @HostBinding('class.ng-toast-container') protected ngToastContainerClass = true;

  protected readonly defaultToastType = ToastType.Success;

  protected messages = signal<(Message & { id: number; remainingLife: number })[]>([]);

  private _timeouts: { [key: number]: number } = {};

  constructor(private readonly _toastService: ToastService, injector: Injector) {
    runInInjectionContext(injector, () => {
      effect(() => {
        this._toastService.messageSource.subscribe(({ message, delay }) => {
          this.add(message, delay);
        });
      });
    });
  }

  protected add(message: Message, delay?: number): void {
    const id = Date.now();
    const messageWithId: Message & { id: number; remainingLife: number } = {
      ...message,
      id: id,
      remainingLife: delay ?? this.life,
    };
    this.messages.update((current) => [...current, messageWithId]);

    this._startTimer(messageWithId);
  }

  protected messageClose(id: number): void {
    this.messages.set(this.messages()?.filter((i) => i.id !== id));
    clearTimeout(this._timeouts[id]);
    delete this._timeouts[id];
  }

  protected mouseEnter(id: number): void {
    clearTimeout(this._timeouts[id]);
    const message = this.messages().find((m) => m.id === id);
    if (message) {
      message.remainingLife -= Date.now() - id;
    }
  }

  protected mouseLeave(id: number): void {
    const message = this.messages().find((m) => m.id === id);
    if (message) {
      this._startTimer(message);
    }
  }

  private _startTimer(message: Message & { id: number; remainingLife: number }): void {
    this._timeouts[message.id] = setTimeout(
      () => this.messageClose(message.id),
      message.remainingLife
    );
  }
}
