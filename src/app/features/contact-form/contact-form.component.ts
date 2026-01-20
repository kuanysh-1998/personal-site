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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { EmailjsService } from '@app/core/services/emailjs/emailjs.service';
import { ContactFormData } from '@app/core/services/emailjs/emailjs.types';
import { DialogRef } from '@app/shared/components/dialog/dialog-ref.service';
import { ButtonConfig } from '@app/shared/components/dialog/dialog.types';
import { TextAreaComponent } from '@app/shared/components/text-area/text-area.component';
import { TextFieldComponent } from '@app/shared/components/text-field/text-field.component';
import { SwitchComponent } from '@app/shared/components/switch/switch.component';
import { ToastService } from '@app/shared/components/toast-container/toast.service';
import { ToastType } from '@app/shared/components/toast/toast.types';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFieldComponent,
    TextAreaComponent,
    SwitchComponent,
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
    contactType: [false],
    contact: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected readonly isSubmitting = signal(false);
  private _originalSubmitButtonConfig: ButtonConfig | undefined;

  public ngOnInit(): void {
    this._saveOriginalSubmitButtonConfig();
    this._setupDialogEvents();
    this._setupContactTypeSubscription();
    this._updateContactValidators();
  }

  protected getContactLabel(): string {
    return this.form.get('contactType')?.value ? 'Telegram' : 'Email';
  }

  protected getContactPlaceholder(): string {
    return this.form.get('contactType')?.value ? 'Enter @username' : 'Enter email address';
  }

  protected onContactTypeChange(value: boolean): void {
    this._resetContactField();
  }

  private _setupContactTypeSubscription(): void {
    this.form
      .get('contactType')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._resetContactField();
      });
  }

  private _resetContactField(): void {
    const contactControl = this.form.get('contact');
    contactControl?.setValue('');
    contactControl?.markAsUntouched();
    this._updateContactValidators();
    this._cdr.markForCheck();
  }

  private _updateContactValidators(): void {
    const contactControl = this.form.get('contact');
    const isTelegram = this.form.get('contactType')?.value;

    if (isTelegram) {
      contactControl?.setValidators([
        Validators.required,
        Validators.maxLength(100),
        this._telegramValidator.bind(this),
      ]);
    } else {
      contactControl?.setValidators([
        Validators.required,
        Validators.maxLength(100),
        Validators.email,
      ]);
    }

    contactControl?.updateValueAndValidity({ emitEvent: false });
  }

  private _telegramValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();
    if (!value) {
      return null;
    }

    const telegramPattern = /^@?[a-zA-Z0-9_]{5,32}$/;
    const normalizedValue = value.startsWith('@') ? value : '@' + value;

    return telegramPattern.test(normalizedValue) ? null : { telegram: true };
  }

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
    if (control.errors['email']) return 'Invalid email address';
    if (control.errors['telegram']) {
      return 'Invalid Telegram username. Use @username or username (5-32 characters, letters, numbers, underscore)';
    }
    return '';
  }

  protected getDescriptionError(): string {
    const control = this.form.get('description');
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxlength']) return 'Maximum length is 2000 characters';
    return '';
  }

  protected getDescriptionHelperText(): string {
    const length = this.form.get('description')?.value?.length || 0;
    return `${length} / 2000`;
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
