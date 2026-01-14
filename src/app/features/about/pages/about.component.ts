import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SocialConnectComponent } from '../components/social-connect/social-connect.component';
import { LatestPosts } from '@app/features/blog/components/latest-posts/latest-posts';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { AvatarComponent } from '@app/shared/components/avatar/avatar.component';

@Component({
  selector: 'app-about',
  imports: [SocialConnectComponent, LatestPosts, TooltipDirective, AvatarComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  public get astanaTime(): string {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const astanaTime = new Date(utcTime + 5 * 3600000);

    const hours = astanaTime.getHours();
    const minutes = astanaTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `Time: ${displayHours}:${displayMinutes} ${ampm}`;
  }
}
