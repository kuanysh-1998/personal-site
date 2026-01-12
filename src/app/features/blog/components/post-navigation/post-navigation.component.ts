import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostMetadata } from '@app/entities/post/models/post.interface';

@Component({
  selector: 'app-post-navigation',
  imports: [RouterLink],
  templateUrl: './post-navigation.component.html',
  styleUrl: './post-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostNavigationComponent {
  @Input() public previousPost: PostMetadata | null = null;
  @Input() public nextPost: PostMetadata | null = null;
}
