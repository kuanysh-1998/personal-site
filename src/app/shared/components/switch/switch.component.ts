import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { LabelComponent } from '../label/label.component';
import { VariantSwitch } from './switch.types';

@Component({
  selector: 'ng-switch',
  imports: [CommonModule, LabelComponent],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() public label: string = '';
  @Input() public labelInfo: string | TemplateRef<unknown> = '';
  @Input() public position: 'left' | 'right' | 'top' = 'right';
  @Input() public disabled: boolean = false;
  @Input() public variant: VariantSwitch = 'default';
  @Input() public requiredForLabel: boolean | undefined = undefined;
  @Input() public token: string | undefined = undefined;

  @Input()
  public set value(value: boolean) {
    if (value !== this._value) {
      this._value = value;
      this._onChange?.(value);
    }
  }

  public get isDisabled(): boolean {
    return this.disabled || this._isDisabled();
  }

  public get value(): boolean {
    return this._value;
  }

  public get positionClass(): string {
    return `ng-switch__${this.position}`;
  }

  public get variantClass(): string {
    return `ng-switch__control-${this.variant}`;
  }

  public changed = output<boolean>();

  private readonly _isDisabled = signal(false);
  private _value = false;

  private _onTouched: () => void = () => {};
  private _onChange: (value: boolean) => void = () => {};

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled.set(isDisabled);
  }

  public switchToggle(): void {
    if (this.isDisabled) {
      return;
    }
    this._onTouched?.();
    this.value = !this.value;
    this.changed.emit(this.value);
  }

  public writeValue(value: boolean): void {
    this._value = value;
    this._cdr.markForCheck();
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
}
