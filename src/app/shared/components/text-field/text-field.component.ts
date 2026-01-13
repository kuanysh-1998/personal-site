import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Optional,
  Output,
  Self,
  signal,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';

import { LabelComponent } from '../label/label.component';
import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  selector: 'ng-text-field',
  imports: [CommonModule, LabelComponent, SvgComponent],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TextFieldComponent implements ControlValueAccessor, AfterViewInit, DoCheck {
  @ViewChild('inputEl') public readonly inputEl!: ElementRef<HTMLInputElement>;

  @Input() public name = '';
  @Input() public label = '';
  @Input() public labelLocation = 'left';
  @Input() public labelInfo = '';
  @Input() public labelBold = false;
  @Input() public shortErrorMessage = '';
  @Input() public maxLength = 0;
  @Input() public requiredForLabel = false;
  @Input() public placeholder = '';
  @Input() public disabled = false;
  @Input() public readOnly = false;
  @Input() public autoFocus = false;
  @Input() public autocomplete = '';
  @Input() public customInputTemplate: TemplateRef<unknown> | undefined = undefined;
  @Input() public icon = '';
  @Input() public iconRight = '';
  @Input() public token = '';
  @Input() public type = 'text';
  @Input() public error = false;
  @Input() public errorMessage = '';
  @Input() public helperText = '';
  @Input() public helperTextTemplate: TemplateRef<unknown> | undefined = undefined;
  @Input() public size = 'default';
  @Input() public prefix = '';
  @Input() public postfix = '';

  @Input() public offValueChanges = false;
  @Input() public labelStyling = false;

  @Input()
  public set value(value: string | number | undefined | null) {
    if (value === undefined || value === null) {
      this._value = '';
      this._onChange?.('');
      return;
    }
    if (value !== this._value) {
      this._value = `${value}`;
      this._onChange?.(`${value}`);
    }
  }

  public get value(): string {
    return this._value;
  }

  @Output() public changed = new EventEmitter<Event>();
  @Output() public blurred = new EventEmitter<void>();
  @Output() public focused = new EventEmitter<void>();
  @Output() public iconRightClick = new EventEmitter<void>();

  public visiblePassword = signal(false);

  public isFocused = signal(false);

  @HostBinding('class.ng-text-field') protected hostClass = true;

  private _onTouched: () => void = () => {};
  private _onChange: (value: string) => void = () => {};

  private _value = '';
  private readonly _isDisabled = signal(false);

  public get rightIcon(): string | undefined {
    return this.type === 'password' ? this.passwordIcon : this.iconRight;
  }

  public get passwordIcon(): string {
    return !this.visiblePassword() ? Icons.Close : Icons.CopyIcon; // TODO: add eye icon
  }

  public get isDisabled(): boolean {
    return this._isDisabled() || !!this.disabled;
  }

  public get errorText(): string {
    const firstError = Object.values(this.control?.errors ?? {})[0];
    return (this.errorMessage || (typeof firstError === 'string' ? firstError : null)) ?? '';
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isSmall(): boolean {
    return this.size === 'small';
  }

  public get isLarge(): boolean {
    return this.size === 'large';
  }

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || this.error;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.requiredForLabel !== false
    );
    return this.requiredForLabel || hasRequiredValidator;
  }

  protected get textfieldClasses(): Record<string, boolean> {
    return {
      ['ng-text-field__container']: true,
      ['ng-text-field__container_left-label']: this.labelLocation === 'left',
    };
  }

  protected get inputClasses(): Record<string, boolean> {
    return {
      input: true,
      invalid: this.isError,
      [this.size]: true,
      'with-prefix': !!this.prefix,
      'with-postfix': !!this.postfix,
      'with-icon': !!this.icon,
      'with-icon-right': !!this.iconRight,
    };
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngAfterViewInit(): void {
    if (this.autoFocus) {
      this.focus();
    }
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public focus(): void {
    this.inputEl.nativeElement.focus();
  }

  public blur(): void {
    this._onTouched?.();
    this.blurred.emit();
  }

  public onValueChange(event: Event): void {
    if (this.offValueChanges) {
      this.changed.emit(event);
      return;
    }
    this.value = (event.target as HTMLInputElement).value?.trim() ?? '';
    this.changed.emit(event);
  }

  public writeValue(value: string): void {
    this.value = value?.trim();
  }

  public registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled.set(isDisabled);
  }

  public onIconRightClick(): void {
    if (this.type === 'password') {
      this.visiblePassword.set(!this.visiblePassword());
    } else {
      this.iconRightClick.emit();
    }
  }
}
