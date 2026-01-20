import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  HostBinding,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { SvgComponent } from '../svg/svg.component';
import { Icons } from '../svg/svg.config';

@Component({
  imports: [CommonModule, SvgComponent],
  encapsulation: ViewEncapsulation.None,
  selector: 'ng-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent implements OnInit {
  public header = input<string>('');
  public subtitle = input<string>('');
  public chevronAlign = input<'left' | 'right'>('right');
  public initialState = input<'opened' | 'closed'>('closed');
  public enablePadding = input(true);
  public headerContent = input<TemplateRef<void> | undefined>(undefined);
  public headerIcon = input<string | undefined>(undefined);

  public opened = output<void>();
  public closed = output<void>();

  public isOpen = signal(false);

  @HostBinding('class.ng-accordion') protected hostClass = true;

  protected isLeftChevron = computed(() => this.chevronAlign() === 'left');

  protected readonly chevronIcon = Icons.ChevronRight;

  protected accordionTitleClasses = computed(() => ({
    'ng-accordion__header-wrapper': true,
    'ng-accordion__header-wrapper_chevron-left': this.isLeftChevron(),
    'ng-accordion__header-wrapper_open': this.isOpen(),
  }));

  protected accordionItemClasses = computed(() => ({
    'ng-accordion__item': true,
    'ng-accordion__item_padding': this.enablePadding() && this.isOpen(),
  }));

  protected contentWrapperClasses = computed(() => ({
    'ng-accordion__content-wrapper': true,
    'ng-accordion__content-wrapper_expanded': this.isOpen(),
  }));

  constructor() {
    effect(() => {
      this.isOpen() ? this.opened.emit() : this.closed.emit();
    });
  }

  public ngOnInit(): void {
    this.isOpen.set(this.initialState() === 'opened');
  }

  public toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  public open(): void {
    this.isOpen.set(true);
  }

  public close(): void {
    this.isOpen.set(false);
  }
}
