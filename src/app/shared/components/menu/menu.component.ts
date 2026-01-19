import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';

import { ListItemComponent } from '../list-item/list-item.component';
import { PopoverComponent } from '../popover/popover.component';
import { DividerComponent } from '../divider/divider.component';
import { ListItem } from '../list-item/list-item.component.types';

@Component({
  selector: 'ng-menu',
  imports: [ListItemComponent, PopoverComponent, DividerComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input() public for: Element | string | number | undefined = undefined;
  @Input() public items: ListItem[] = [];
  @Input() public padding: 'small' | 'medium' | 'large' = 'medium';
  @Input() public position: string = 'left bottom';

  @Input() public header: string | undefined = undefined;
  @Input() public minWidth: number | undefined = undefined;

  @Input()
  public set isOpen(value: boolean) {
    this.isOpenSignal.set(value);
  }

  @Output() public closed = new EventEmitter<void>();
  @Output() public clicked = new EventEmitter<number>();

  protected isOpenSignal = signal(false);

  public toggle(): void {
    this.isOpenSignal.set(!this.isOpenSignal());
  }

  public close(): void {
    this.isOpenSignal.set(false);
    this.closed.emit();
  }

  protected get isSomeItemVisible(): boolean {
    return this.items.some((i: ListItem) => i.visible || i.visible === undefined) || !!this.header;
  }

  protected clickItem(item: ListItem, index: number): void {
    if (item.disable) return;
    if (item.action) item.action();
    this.clicked.emit(index);
    this.close();
  }
}
