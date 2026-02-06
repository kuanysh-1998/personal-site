import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { PostMetadata } from '@app/entities/post/models/post.interface';
import { ListItemComponent } from '@app/shared/components/list-item/list-item.component';

@Component({
  selector: 'app-post-navigation',
  imports: [TranslocoModule, ListItemComponent],
  templateUrl: './post-navigation.component.html',
  styleUrl: './post-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostNavigationComponent {
  @Input() public previousPost: PostMetadata | null = null;
  @Input() public nextPost: PostMetadata | null = null;
}
