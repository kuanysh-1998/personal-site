import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Icons } from '../svg/svg.config';
import { PageChangeEvent } from './pagination.types';

@Component({
  selector: 'app-pagination',
  imports: [ButtonComponent],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() public set currentPage(value: number) {
    this._currentPage.set(value);
  }

  @Input() public set totalItems(value: number) {
    this._totalItems.set(value);
  }

  @Input() public set itemsPerPage(value: number) {
    this._itemsPerPage.set(value);
  }

  @Input() public maxVisiblePages = 5;

  @Output() public pageChange = new EventEmitter<PageChangeEvent>();

  protected readonly _currentPage = signal<number>(1);
  protected readonly _totalItems = signal<number>(0);
  protected readonly _itemsPerPage = signal<number>(10);

  protected readonly totalPages = computed(() => {
    const total = this._totalItems();
    const perPage = this._itemsPerPage();
    return Math.ceil(total / perPage);
  });

  protected readonly visiblePages = computed(() => {
    const current = this._currentPage();
    const total = this.totalPages();
    const max = this.maxVisiblePages;

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(max / 2);
    let startPage = Math.max(1, current - halfVisible);
    const endPage = Math.min(total, startPage + max - 1);

    if (endPage - startPage < max - 1) {
      startPage = Math.max(1, endPage - max + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  });

  protected readonly hasPrevious = computed(() => this._currentPage() > 1);
  protected readonly hasNext = computed(() => this._currentPage() < this.totalPages());
  protected readonly showFirstPage = computed(() => {
    const pages = this.visiblePages();
    return pages.length > 0 && pages[0] > 1;
  });

  protected readonly showLastPage = computed(() => {
    const pages = this.visiblePages();
    return pages.length > 0 && pages[pages.length - 1] < this.totalPages();
  });

  protected readonly chevronLeftIcon = Icons.ChevronLeft;
  protected readonly chevronRightIcon = Icons.ChevronRight;

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this._currentPage()) {
      return;
    }

    this._currentPage.set(page);
    this.pageChange.emit({
      page,
      itemsPerPage: this._itemsPerPage(),
    });
  }

  protected previousPage(): void {
    if (this.hasPrevious()) {
      this.goToPage(this._currentPage() - 1);
    }
  }

  protected nextPage(): void {
    if (this.hasNext()) {
      this.goToPage(this._currentPage() + 1);
    }
  }

  protected isCurrentPage(page: number): boolean {
    return page === this._currentPage();
  }
}
