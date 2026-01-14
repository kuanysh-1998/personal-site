import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';

import { LabelComponent } from '../label/label.component';
import { Icons } from '../svg/svg.config';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'ng-checkbox',
  imports: [CommonModule, SvgComponent, LabelComponent],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor, DoCheck {
  @Input() public label = '';
  @Input() public labelBold = false;
  @Input() public disabled = false;
  @Input() public error = false;
  @Input() public tabIndex = 0;

  @Input() public variant = 'default';
  @Input() public padding = 'default';
  @Input() public requiredForLabel = undefined;
  @Input() public token = undefined;
  @Input() public links = undefined;
  @Input() public indeterminate = false;

  @Input()
  public set value(value: boolean) {
    if (value !== this._value) {
      this._value = value;
      this._onChange?.(value);
    }
  }

  public get value(): boolean {
    return this._value;
  }

  @Output() public changed = new EventEmitter<boolean>();

  public readonly filledCheckboxIcon = Icons.CheckboxFilled;
  public readonly emptyCheckboxIcon = Icons.CheckboxEmpty;
  public readonly indeterminateCheckboxIcon = Icons.CheckboxIndeterminate;

  private readonly _isDisabledSignal = signal<boolean>(false);
  private _value = false;

  private _onTouched: () => void = () => {};
  private _onChange: (value: boolean) => void = () => {};

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabledSignal();
  }

  public get control(): FormControl | undefined {
    return <FormControl<unknown>>this._ngControl?.control;
  }

  public get isRequired(): boolean {
    const hasRequiredValidator = !!(
      this.control?.hasValidator(Validators.required) && this.requiredForLabel !== false
    );
    return this.requiredForLabel || hasRequiredValidator;
  }

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Self() @Optional() private readonly _ngControl?: NgControl
  ) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public ngDoCheck(): void {
    this._cdr.markForCheck();
  }

  public writeValue(value: boolean): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabledSignal.set(isDisabled);
  }

  public toggleCheckbox(event?: Event): void {
    event?.stopPropagation();

    if (this.isDisabled) return;
    this._onTouched?.();
    this.value = !this.value;
    this.changed.emit(this.value);
  }
}
