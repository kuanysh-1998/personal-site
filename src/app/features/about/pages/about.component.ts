import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SocialConnectComponent } from '../components/social-connect/social-connect.component';
import { LatestPosts } from '@app/features/blog/components/latest-posts/latest-posts';

@Component({
  selector: 'app-about',
  imports: [SocialConnectComponent, LatestPosts],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
