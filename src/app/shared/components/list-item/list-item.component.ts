import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgComponent } from '../svg/svg.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DividerComponent } from '../divider/divider.component';

@Component({
  selector: 'ng-list-item',
  imports: [
    CommonModule,
    SvgComponent,
    CheckboxComponent,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    DividerComponent,
  ],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  @ViewChild('item') public listItem!: ElementRef<HTMLDivElement>;

  @Input() public text = '';
  @Input() public headerText = '';
  @Input() public selectable = false;

  @Input()
  public set checked(value: boolean) {
    this._checked.set(value);
  }

  @Input() public enableWrapTwoRows = true;
  @Input() public enableWrapAllRows = false;
  @Input() public enableDivider = false;

  @Input() public icon?: string;
  @Input() public rightIcon?: string;
  @Input() public active = false;
  @Input() public focusStateEnabled = true;
  @Input() public token?: string;
  @Input() public link?: string;
  @Input() public withGap = false;
  @Input() public customTemplate?: any;

  @Input()
  public set disable(value: boolean) {
    if (value) {
      this.focusStateEnabled = this._initialFocusStateEnabled;
    } else {
      this.focusStateEnabled = value;
    }

    this._disable = value;
  }

  @Output() public clicked = new EventEmitter<boolean | void>();

  private readonly _checked = signal(false);
  private readonly _initialFocusStateEnabled = this.focusStateEnabled;

  private _disable = false;

  public get disable(): boolean {
    return this._disable;
  }

  public get checked(): boolean {
    return this._checked();
  }

  protected click(): void {
    if (this.disable) return;
    if (!this.selectable) {
      this.clicked.emit();
      return;
    }
    this.checked = !this.checked;
    this.clicked.emit(this.checked);
  }

  protected clickCheckbox(event: Event, item: HTMLDivElement): void {
    event.stopPropagation();
    item.focus();
  }

  protected changeCheckbox(event: boolean): void {
    if (this.disable) return;
    this.checked = event;
    this.clicked.emit(event);
  }
}
