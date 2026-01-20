import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  AfterViewInit,
  computed,
  OnDestroy,
} from '@angular/core';
import { ListItemComponent } from '@app/shared/components/list-item/list-item.component';
import { ScrollComponent } from '@app/shared/components/scroll/scroll.component';
import { TocItem } from './table-of-contents.types';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [ListItemComponent, ScrollComponent],
  templateUrl: './table-of-contents.component.html',
  styleUrl: './table-of-contents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOfContentsComponent implements AfterViewInit, OnDestroy {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);
  private readonly _cdr = inject(ChangeDetectorRef);

  protected readonly tocItems = signal<TocItem[]>([]);
  protected readonly activeItemId = signal<string>('');
  protected readonly hasItems = computed(() => this.tocItems().length > 0);

  private _observer: MutationObserver | null = null;
  private _intersectionObserver: IntersectionObserver | null = null;

  public ngAfterViewInit(): void {
    if (!this._isBrowser) return;

    setTimeout(() => {
      this._observeMarkdown();
    }, 200);
  }

  public ngOnDestroy(): void {
    this._observer?.disconnect();
    this._intersectionObserver?.disconnect();
  }

  private _observeMarkdown(): void {
    const markdownElement = document.querySelector('markdown');
    if (!markdownElement) {
      console.warn('Markdown element not found');
      return;
    }

    this._extractHeadings();

    if (this.tocItems().length > 0) {
      this._setupIntersectionObserver();
      this._cdr.markForCheck();
      return;
    }

    this._observer = new MutationObserver(() => {
      const headings = markdownElement.querySelectorAll('h2, h3, h4');
      if (headings.length > 0) {
        this._extractHeadings();
        this._setupIntersectionObserver();
        this._cdr.markForCheck();
        this._observer?.disconnect();
      }
    });

    this._observer.observe(markdownElement, {
      childList: true,
      subtree: true,
    });
  }

  private _extractHeadings(): void {
    const markdownElement = document.querySelector('markdown');
    if (!markdownElement) return;

    const headings = markdownElement.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) {
      console.warn('No headings found in markdown');
      return;
    }

    const items: TocItem[] = [];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1), 10);
      const title = heading.textContent?.trim() || '';
      const id = this._generateId(title);

      if (!(heading as HTMLElement).id) {
        (heading as HTMLElement).id = id;
      }

      items.push({
        id,
        title,
        level,
        element: heading as HTMLElement,
      });
    });

    this.tocItems.set(items);
  }

  private _generateId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private _setupIntersectionObserver(): void {
    const items = this.tocItems();
    if (items.length === 0) return;

    const options: IntersectionObserverInit = {
      rootMargin: '-100px 0px -66%',
      threshold: 0,
    };

    this._intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).id;
          if (id) {
            this.activeItemId.set(id);
          }
        }
      });
    }, options);

    items.forEach((item) => {
      this._intersectionObserver?.observe(item.element);
    });
  }

  protected scrollToHeading(item: TocItem): void {
    if (!this._isBrowser) return;

    const elementTop = item.element.getBoundingClientRect().top + window.scrollY;
    const offset = 100;

    window.scrollTo({
      top: elementTop - offset,
      behavior: 'smooth',
    });
  }
}
