import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  signal,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';

import { ButtonComponent } from '../button/button.component';
import { DividerComponent } from '../divider/divider.component';
import { LabelComponent } from '../label/label.component';
import { ListItemComponent } from '../list-item/list-item.component';
import { PopoverComponent } from '../popover/popover.component';
import { SvgComponent } from '../svg/svg.component';
import { TextFieldComponent } from '../text-field/text-field.component';
import { FilterPipe } from './filter.pipe';
import { Icons } from '../svg/svg.config';
import {
  DropdownChangeEvent,
  DropdownOption,
  DropdownOptions,
  DropdownValue,
} from './dropdown.types';

@Component({
  selector: 'ng-dropdown',
  imports: [
    CommonModule,
    ListItemComponent,
    LabelComponent,
    SvgComponent,
    TextFieldComponent,
    ButtonComponent,
    PopoverComponent,
    FilterPipe,
    DividerComponent,
  ],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DropdownComponent implements ControlValueAccessor, OnInit {
  @ViewChildren('listItems') public listItems!: QueryList<ListItemComponent>;

  @Input() public label = '';
  @Input() public labelLocation: 'top' | 'left' = 'top';
  @Input() public labelInfo = '';
  @Input() public labelBold = false;

  @Input() public disabled = false;
  @Input() public readOnly = false;
  @Input() public requiredForLabel: boolean | null = null;

  @Input() public placeholder = '';
  @Input() public displayFieldName = 'name';

  @Input() public multiple = false;
  @Input() public enableSearch = false;
  @Input() public showClearButton = true;
  @Input() public focusStateEnabled = true;
  @Input() public highlightSelectedItems = false;
  @Input() public labelStyling: 'primary' | 'secondary' = 'primary';

  @Input() public emptyMessage = 'Нет данных';
  @Input() public buttonEnabled = false;
  @Input() public buttonLabel = '';
  @Input() public buttonIcon = '';
  @Input() public size: 'small' | 'medium' | 'large' = 'medium';

  @Input() public icon = '';
  @Input() public token = '';

  @Input() public error = false;
  @Input() public errorMessage = '';
  @Input() public helperText = '';
  @Input() public customTemplates: TemplateRef<unknown> | null = null;
  @Input() public customNameFormat?: (value: DropdownOption & Record<string, unknown>) => string;

  @Input()
  public set value(value: DropdownValue) {
    if (value === null || value === undefined || (Array.isArray(value) && !value.length)) {
      this._value = [];
      this._onChange?.(this.multiple ? [] : null);

      if (this.multiple) {
        this._options.set(
          this._processOptions(this.options ?? []).map((option) => ({
            ...option,
            selected: false,
          }))
        );
        this.selectedOptions.set([]);
      }

      this.optionIcon.set('');
      this.inputValue.set('');
      return;
    }

    const normalizedValue = Array.isArray(value) ? value : [value];
    this._value = normalizedValue;

    if (this.multiple) {
      this._onChange?.(normalizedValue);
      this.inputValue.set(
        normalizedValue.length === 1
          ? this._getDisplayValue(normalizedValue[0])
          : this._formatMultipleDisplay(normalizedValue.length)
      );

      if (this.highlightSelectedItems) {
        this.selectedOptions.set(this.options.filter((o) => normalizedValue.includes(o.id)));
      }
    } else {
      this._onChange?.(normalizedValue[0]);
      this.optionIcon.set(this.options.find((i) => i.id === normalizedValue[0])?.icon ?? '');
      this.inputValue.set(this._getDisplayValue(normalizedValue[0]));
    }
  }

  public get value(): (string | number)[] {
    return this._value;
  }

  @Input()
  public set options(opts: DropdownOptions | undefined | null) {
    const processed = this._processOptions(opts ?? []);

    if (this.multiple) {
      this._options.set(
        processed.map((option) => ({
          ...option,
          selected: this._value.includes(option.id),
        }))
      );
      if (this.highlightSelectedItems) {
        this.selectedOptions.set(this.options.filter((o) => o.selected));
      }
    } else {
      this._options.set(processed);
    }
  }

  public get options(): DropdownOptions {
    return this._options();
  }

  @Output() public changed = new EventEmitter<DropdownChangeEvent>();
  @Output() public buttonClicked = new EventEmitter<void>();

  public popoverWidth!: number;
  public inputValue = signal('');
  public isOpen = signal(false);
  public optionIcon = signal('');
  public searchValue = signal('');
  public selectedOptions = signal<DropdownOptions>([]);

  protected readonly icons = Icons;
  protected onTouched?: () => void;

  @HostBinding('class.ng-dropdown') protected hostClass = true;
  @ViewChild('searchTextField') protected readonly textField?: TextFieldComponent;
  @ViewChild('dropdownWrapper') private readonly _dropdownWrapper!: ElementRef;

  private _onChange: (value: DropdownValue) => void = () => {};
  private readonly _options = signal<DropdownOptions>([]);
  private _value: (string | number)[] = [];
  private readonly _isDisabled = signal(false);
  private _currentFocusedIndex = -1;

  constructor(@Self() @Optional() private readonly _ngControl: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public get control(): FormControl | undefined {
    return this._ngControl?.control as FormControl;
  }

  public get errorText(): string {
    const firstError = Object.values(this.control?.errors ?? {})[0];
    return this.errorMessage || (typeof firstError === 'string' ? firstError : '') || '';
  }

  public get isDisabled(): boolean {
    return this._isDisabled() || this.disabled;
  }

  public get isError(): boolean {
    return (this.control?.invalid && this.control?.touched) || this.error;
  }

  public get isRequired(): boolean {
    return this.requiredForLabel ?? !!this.control?.hasValidator(Validators.required);
  }

  public get hasValue(): boolean {
    return !!this.value?.length && this.showClearButton && !this.disabled && !this.readOnly;
  }

  protected get dropdownClasses(): Record<string, boolean> {
    return {
      'ng-dropdown__container': true,
      'ng-dropdown__container_left-label': this.labelLocation === 'left',
    };
  }

  public ngOnInit(): void {}

  public writeValue(value: DropdownValue): void {
    this.value = value;
  }

  public registerOnChange(fn: (value: DropdownValue) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled.set(isDisabled);
  }

  public selectOption(event: boolean | void, option: DropdownOption): void {
    if (!this.multiple) {
      this.value = [option.id];
      this.changed.emit(option.id);
      this.isOpen.set(false);
      return;
    }

    this.value = event ? [...this._value, option.id] : this._value.filter((v) => v !== option.id);

    this.changed.emit(this.value);

    const foundOption = this.options.find((o) => o.id === option.id);
    if (foundOption) {
      foundOption.selected = !!event;
    }
  }

  public open(): void {
    if (this.readOnly) return;

    this._currentFocusedIndex = -1;
    this._setupMinWidth();
    this.isOpen.update((v) => !v);
    this.searchValue.set('');
  }

  public clearValue(): void {
    this.value = [];
    this.changed.emit(this.multiple ? [] : null);
  }

  public close(): void {
    this.isOpen.set(false);
    this.onTouched?.();
  }

  public openOnClick(): void {
    if (!this.isOpen() && !this.isDisabled && !this.readOnly) {
      this.open();
    }
  }

  public changedSearch(event: Event): void {
    this.searchValue.set((event.target as HTMLInputElement).value.trim().toLowerCase());
  }

  public getOptionText(option: DropdownOption & Record<string, unknown>): string {
    return (option?.[this.displayFieldName] as string) || '';
  }

  @HostListener('keydown', ['$event'])
  protected focusListElements(event: KeyboardEvent): void {
    if (!this.isOpen() || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;

    event.preventDefault();
    const items = this.listItems.toArray();
    const len = items.length;

    this._currentFocusedIndex =
      event.key === 'ArrowDown'
        ? (this._currentFocusedIndex + 1) % len
        : (this._currentFocusedIndex - 1 + len) % len;

    items[this._currentFocusedIndex]?.listItem.nativeElement.focus();
  }

  private _processOptions(options: DropdownOptions): DropdownOptions {
    if (!this.customNameFormat) return options;

    return options.map((option) => ({
      ...option,
      [this.displayFieldName]: this.customNameFormat!(option),
    }));
  }

  private _setupMinWidth(): void {
    this.popoverWidth = this._dropdownWrapper.nativeElement.offsetWidth;
  }

  private _getDisplayValue(id: string | number): string {
    const option = this.options.find((o) => o.id === id);
    return option ? String(option[this.displayFieldName]) : '';
  }

  private _formatMultipleDisplay(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    const word =
      mod10 === 1 && mod100 !== 11
        ? 'элемент'
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'элемента'
        : 'элементов';

    return `${count} ${word} выбрано`;
  }
}
