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
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';

import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'ng-text-area',
  imports: [CommonModule, LabelComponent],
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TextAreaComponent implements ControlValueAccessor, AfterViewInit, DoCheck {
  @Input() public label: string | undefined = '';
  @Input() public labelLocation: 'left' | 'top' = 'top';
  @Input() public labelInfo: string = '';
  @Input() public labelBold = false;
  @Input() public placeholder: string = '';
  @Input() public requiredForLabel: boolean | undefined = undefined;
  @Input() public disabled = false;
  @Input() public readOnly = false;
  @Input() public token: string | undefined = undefined;
  @Input() public error = false;
  @Input() public errorMessage: string | undefined = undefined;
  @Input() public helperText: string | undefined = undefined;
  @Input() public minHeight: number | undefined = undefined;
  @Input() public maxHeight: number | undefined = undefined;
  @Input() public autoResizeEnabled = false;
  @Input()
  public set value(value: string) {
    if (value !== this._value()) {
      this._value.set(value ?? '');
      this._onChange?.(value);
    }
  }

  @Output() public changed = new EventEmitter<Event>();
  @Output() public blurred = new EventEmitter<void>();
  @Output() public focused = new EventEmitter<void>();

  public textArea = viewChild<ElementRef<HTMLTextAreaElement>>('inputEl');

  public onTouched?: () => void;

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
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

  public get errorText(): string {
    const firstError = Object.values(this.control?.errors ?? {})[0];
    return (this.errorMessage || (typeof firstError === 'string' ? firstError : null)) ?? '';
  }

  public get value(): string {
    return this._value();
  }

  public get isDisabled(): boolean {
    return this._isDisabled() || this.disabled;
  }

  @HostBinding('class.ng-text-area') protected hostClass = true;

  protected get textareaClasses(): Record<string, boolean> {
    return {
      ['ng-text-area__container']: true,
      ['ng-text-area__container_left-label']: this.labelLocation === 'left',
    };
  }

  protected get textareaStyle(): { [key: string]: string | number } {
    const styles: { [key: string]: string | number } = {};

    if (this.minHeight !== undefined) {
      styles['min-height'] = `${this.minHeight}px`;
      styles['height'] = `${this.minHeight}px`;
    }

    if (this.maxHeight !== undefined) {
      styles['max-height'] = `${this.maxHeight}px`;
    }

    return styles;
  }

  private _onChange: (value: string) => void = () => {};

  private readonly _value = signal('');
  private readonly _isDisabled = signal(false);

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngAfterViewInit(): void {
    const textarea = this.textArea()?.nativeElement;

    if (this.autoResizeEnabled && textarea) {
      textarea.style.height = 'auto';

      const newHeight = Math.min(textarea.scrollHeight, this.maxHeight || Infinity);
      textarea.style.height = `${newHeight}px`;

      if (textarea.scrollHeight >= (this.maxHeight || Infinity)) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
    this._cdr.detectChanges();
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public onValueChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newValue = textarea.value?.trim() ?? '';

    this.value = newValue;
    this.changed.emit(event);

    if (this.autoResizeEnabled) {
      textarea.style.height = 'auto';

      const newHeight = Math.min(textarea.scrollHeight, this.maxHeight || Infinity);
      textarea.style.height = `${newHeight}px`;

      if (textarea.scrollHeight >= (this.maxHeight || Infinity)) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }

  public writeValue(value: string): void {
    this.value = value?.trim();
  }

  public registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled.set(isDisabled);
  }

  public blur(): void {
    this.onTouched?.();
    this.blurred.emit();
  }
}
