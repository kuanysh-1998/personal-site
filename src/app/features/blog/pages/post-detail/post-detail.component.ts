import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { PostService } from '@app/entities/post/services/post.service';
import { Post } from '@app/entities/post/models/post.interface';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterModule, MarkdownComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _postService = inject(PostService);

  protected readonly post$: Observable<Post | null> = this._route.paramMap.pipe(
    map((params) => params.get('slug') || ''),
    switchMap((slug) => this._postService.getPostBySlug(slug))
  );

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
