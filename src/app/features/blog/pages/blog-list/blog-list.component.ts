import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostGroup } from '@app/entities/post/models/post.interface';
import { PostService } from '@app/entities/post/services/post.service';
import { PostSearchComponent } from '@app/features/blog/components/post-search/post-search.component';
import { CardComponent } from '@app/shared/components/card/card.component';
import { Icons } from '@app/shared/components/svg/svg.config';

@Component({
  selector: 'app-blog-list',
  imports: [PostSearchComponent, CardComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly _postService = inject(PostService);
  private readonly _router = inject(Router);

  protected readonly searchQuery = signal<string>('');

  protected readonly filteredPosts = computed(() => {
    const query = this.searchQuery();
    return this._postService.searchPosts(query);
  });

  protected readonly postsByYear = computed(() => {
    const posts = this.filteredPosts();
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
  }

  protected onSearchClear(): void {
    this.searchQuery.set('');
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
