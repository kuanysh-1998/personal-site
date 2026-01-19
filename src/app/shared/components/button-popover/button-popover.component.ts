import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { MenuComponent } from '../menu/menu.component';
import { PopoverComponent } from '../popover/popover.component';
import { PopoverPosition } from '../popover/popover.types';
import { ButtonVariant, StylingMode } from '../button/button.types';
import { ListItem } from '../list-item/list-item.component.types';

@Component({
  selector: 'ng-button-popover',
  templateUrl: './button-popover.component.html',
  imports: [ButtonComponent, MenuComponent, PopoverComponent],
  styleUrls: ['./button-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPopoverComponent implements AfterViewInit {
  @Input() public stylingMode: StylingMode = 'contained';
  @Input() public variant: ButtonVariant = 'default';
  @Input() public disabled: boolean = false;
  @Input() public label: string = '';
  @Input() public position: PopoverPosition = 'bottom left';
  @Input() public type = 'content';
  @Input() public iconRight = null;
  @Input() public menuItems: ListItem[] = [];
  @Input() public padding: 'small' | 'medium' | 'large' = 'medium';
  @Input() public maxHeight = undefined;
  @Input() public fullWidth = false;

  @Input() public menuHeader = undefined;
  @Input() public token = undefined;
  @Input() public icon = undefined;

  @Output() public closed = new EventEmitter<void>();
  @Output() public opened = new EventEmitter<void>();
  @Output() public clicked = new EventEmitter<number>();

  public isOpen = signal(false);

  @HostBinding('style.width')
  protected get width(): string | null {
    return this.fullWidth ? '100%' : null;
  }

  protected popoverWidth = signal(0);

  @ViewChild('button') private readonly _button!: ElementRef;

  protected get isMenu(): boolean {
    return this.type === 'menu';
  }

  public ngAfterViewInit(): void {
    this._setupMinWidth();
  }

  public open(): void {
    this.isOpen.set(true);
    this.opened.emit();
  }

  public close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  public toggle(): void {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) this.opened.emit();
  }

  private _setupMinWidth(): void {
    requestAnimationFrame(() => {
      if (this.position.startsWith('top') || this.position.startsWith('bottom')) {
        this.popoverWidth.set(this._button.nativeElement.offsetWidth);
      }
    });
  }
}
