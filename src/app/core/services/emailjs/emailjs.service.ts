import { inject, Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../../environments/environment';
import { ContactFormData } from './emailjs.types';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { ToastService } from '@app/shared/components/toast-container/toast.service';
import { ToastType } from '@app/shared/components/toast/toast.types';

@Injectable()
export class EmailjsService {
  private readonly _toastService = inject(ToastService);
  private readonly _serviceId = environment.emailjs.serviceId;
  private readonly _templateId = environment.emailjs.templateId;
  private readonly _publicKey = environment.emailjs.publicKey;
  private _isInitialized = false;

  public sendContactForm(data: ContactFormData): Observable<void> {
    this._initializeEmailjs();

    const templateParams = {
      subject: data.subject,
      contact: data.contact,
      description: data.description,
    };

    return from(emailjs.send(this._serviceId, this._templateId, templateParams)).pipe(
      map(() => void 0),
      catchError((error) => {
        this._toastService.add({
          type: ToastType.Error,
          header: 'Error',
          message: error.message,
        });
        return throwError(() => error);
      })
    );
  }

  private _initializeEmailjs(): void {
    if (this._isInitialized) {
      return;
    }

    if (!this._publicKey) {
      throw new Error(
        'EmailJS publicKey is not configured. Please specify publicKey in environment.ts'
      );
    }

    emailjs.init(this._publicKey);
    this._isInitialized = true;
  }
}
