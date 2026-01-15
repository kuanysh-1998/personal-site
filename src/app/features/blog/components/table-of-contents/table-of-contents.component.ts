import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  AfterViewInit,
  ElementRef,
  effect,
  computed,
} from '@angular/core';
import { fromEvent, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListItemComponent } from '@app/shared/components/list-item/list-item.component';
import { TocItem } from './table-of-contents.types';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [ListItemComponent],
  templateUrl: './table-of-contents.component.html',
  styleUrl: './table-of-contents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOfContentsComponent implements AfterViewInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _elementRef = inject(ElementRef);

  protected readonly tocItems = signal<TocItem[]>([]);
  protected readonly activeItemId = signal<string>('');

  protected readonly hasItems = computed(() => this.tocItems().length > 0);

  constructor() {
    effect(() => {
      const items = this.tocItems();
      if (items.length > 0) {
        this._addIdsToHeadings(items);
      }
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this._extractHeadings();
      this._setupScrollTracking();
    }, 100);
  }

  private _extractHeadings(): void {
    const markdownElement = document.querySelector('markdown');
    if (!markdownElement) {
      return;
    }

    const headings = markdownElement.querySelectorAll('h2, h3, h4');
    const items: TocItem[] = [];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1), 10);
      const title = heading.textContent?.trim() || '';
      const id = this._generateId(title);

      items.push({
        id,
        title,
        level,
        element: heading as HTMLElement,
      });
    });

    this.tocItems.set(items);
  }

  private _addIdsToHeadings(items: TocItem[]): void {
    items.forEach((item) => {
      if (!item.element.id) {
        item.element.id = item.id;
      }
    });
  }

  private _generateId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private _setupScrollTracking(): void {
    fromEvent(window, 'scroll', { passive: true })
      .pipe(throttleTime(100), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._updateActiveItem();
      });

    this._updateActiveItem();
  }

  private _updateActiveItem(): void {
    const items = this.tocItems();
    if (items.length === 0) {
      return;
    }

    const offset = 100;
    const scrollPosition = window.scrollY + offset;
    let activeId = '';

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const elementTop = item.element.getBoundingClientRect().top + window.scrollY;

      if (scrollPosition >= elementTop) {
        activeId = item.id;
        break;
      }
    }

    if (activeId) {
      this.activeItemId.set(activeId);
    } else {
      this.activeItemId.set(items[0]?.id || '');
    }
  }

  protected scrollToHeading(item: TocItem): void {
    const elementTop = item.element.getBoundingClientRect().top + window.scrollY;
    const offset = 100;

    window.scrollTo({
      top: elementTop - offset,
      behavior: 'smooth',
    });

    this.activeItemId.set(item.id);
  }
}
