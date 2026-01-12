import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostGroup } from '@app/entities/post/models/post.interface';
import { PostService } from '@app/entities/post/services/post.service';

@Component({
  selector: 'app-blog-list',
  imports: [RouterLink],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly _postService = inject(PostService);

  protected readonly postsByYear = computed(() => {
    const grouped = this._postService.getPostsGroupedByYear();
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

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
}
