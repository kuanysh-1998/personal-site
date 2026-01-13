import { Injectable } from '@angular/core';
import { Message } from '@app/shared/components/toast/toast.types';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public messageSource = new Subject<{ message: Message; delay?: number }>();

  public add(message: Message, delay?: number): void {
    if (message) {
      this.messageSource.next({ message, delay });
    }
  }
}
