import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '../dialog/dialog-ref.service';
import { ButtonConfig } from '../dialog/dialog.types';
import { TextFieldComponent } from '../text-field/text-field.component';
import { LabelComponent } from '../label/label.component';
import { EmailjsService } from '../../../core/services/emailjs/emailjs.service';
import { ContactFormData } from '../../../core/services/emailjs/emailjs.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../toast-container/toast.service';
import { ToastType } from '../toast/toast.types';
import { FormFieldErrorComponent } from '../form-field-error/form-field-error.component';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFieldComponent,
    LabelComponent,
    FormFieldErrorComponent,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _emailjsService = inject(EmailjsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _toastService = inject(ToastService);
  private readonly _cdr = inject(ChangeDetectorRef);

  protected readonly form: FormGroup = this._fb.group({
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    contact: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected readonly isSubmitting = signal(false);
  private _originalSubmitButtonConfig: ButtonConfig | undefined;

  protected getSubjectError(): string {
    const control = this.form.get('subject');
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxlength']) return 'Maximum length is 200 characters';
    return '';
  }

  protected getContactError(): string {
    const control = this.form.get('contact');
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxlength']) return 'Maximum length is 100 characters';
    return '';
  }

  public ngOnInit(): void {
    this._saveOriginalSubmitButtonConfig();
    this._setupDialogEvents();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      this._cdr.markForCheck();
      this._toastService.add({
        type: ToastType.Error,
        header: 'Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    this.isSubmitting.set(true);
    this._disableSubmitButton();

    const contactData: ContactFormData = this.form.value;

    this._emailjsService
      .sendContactForm(contactData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.form.reset();
          this._toastService.add({
            type: ToastType.Success,
            header: 'Success',
            message: 'Your message has been sent',
          });
          this._dialogRef.close();
        },
        error: () => {
          this.isSubmitting.set(false);
          this._enableSubmitButton();
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  private _saveOriginalSubmitButtonConfig(): void {
    const currentConfig = this._dialogRef.instance?.submitButtonConfig;
    if (currentConfig) {
      this._originalSubmitButtonConfig = { ...currentConfig };
    }
  }

  private _disableSubmitButton(): void {
    const currentConfig = this._dialogRef.instance?.submitButtonConfig;
    if (currentConfig) {
      this._dialogRef.updateSubmitButton({
        ...currentConfig,
        disabled: true,
      });
    }
  }

  private _enableSubmitButton(): void {
    if (this._originalSubmitButtonConfig) {
      this._dialogRef.updateSubmitButton({
        ...this._originalSubmitButtonConfig,
        disabled: false,
      });
    }
  }

  private _setupDialogEvents(): void {
    this._dialogRef.instance?.submitted
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.onSubmit());

    this._dialogRef.instance?.canceled
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._dialogRef.close());
  }
}
