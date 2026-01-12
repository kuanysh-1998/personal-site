import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogComponent {
  protected readonly markdownPath = signal('/assets/posts/my-first-post.md');
}
