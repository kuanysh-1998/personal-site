import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostGroup } from '@app/entities/post/models/post.interface';
import { PostService } from '@app/entities/post/services/post.service';
import { TranslocoModule } from '@ngneat/transloco';
import { PostSearchComponent } from '@app/features/blog/components/post-search/post-search.component';
import { CardComponent } from '@app/shared/components/card/card.component';
import { BadgeComponent } from '@app/shared/components/badge/badge.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { PaginationComponent } from '@app/shared/components/pagination/pagination.component';
import { PageChangeEvent } from '@app/shared/components/pagination/pagination.types';

@Component({
  selector: 'app-blog-list',
  imports: [
    TranslocoModule,
    PostSearchComponent,
    CardComponent,
    BadgeComponent,
    PaginationComponent,
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly _postService = inject(PostService);
  private readonly _router = inject(Router);

  protected readonly searchQuery = signal<string>('');
  protected readonly currentPage = signal<number>(1);
  protected readonly itemsPerPage = signal<number>(5);

  protected readonly filteredPosts = computed(() => {
    const query = this.searchQuery();
    return this._postService.searchPosts(query);
  });

  protected readonly paginatedPosts = computed(() => {
    const posts = this.filteredPosts();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return posts.slice(startIndex, endIndex);
  });

  protected readonly totalFilteredPosts = computed(() => {
    return this.filteredPosts().length;
  });

  protected readonly postsByYear = computed(() => {
    const posts = this.paginatedPosts();
    const grouped = new Map<number, typeof posts>();

    posts.forEach((post) => {
      const year = new Date(post.date).getFullYear();
      const yearPosts = grouped.get(year) || [];
      grouped.set(year, [...yearPosts, post]);
    });

    const groups: PostGroup[] = [];
    const years = Array.from(grouped.keys()).sort((a, b) => b - a);

    years.forEach((year) => {
      groups.push({
        year,
        posts: grouped.get(year) || [],
      });
    });

    return groups;
  });

  protected readonly hasSearchResults = computed(() => {
    return this.filteredPosts().length > 0;
  });

  protected readonly isSearching = computed(() => {
    return this.searchQuery().trim().length > 0;
  });

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onSearchClear(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  protected onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }

  protected readonly chevronRightIcon: string = Icons.ChevronRight;

  protected onPostClick(slug: string): void {
    this._router.navigate(['/blog', slug]);
  }
}
