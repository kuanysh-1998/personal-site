import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SocialConnectComponent } from '../components/social-connect/social-connect.component';
import { LatestPosts } from '@app/features/blog/components/latest-posts/latest-posts';
import { TooltipDirective } from '@app/shared/components/tooltip/tooltip.directive';
import { AvatarComponent } from '@app/shared/components/avatar/avatar.component';
import { CardComponent } from '@app/shared/components/card/card.component';
import { BadgeComponent } from '@app/shared/components/badge/badge.component';
import { StackTechnology } from './about.types';

@Component({
  selector: 'app-about',
  imports: [
    SocialConnectComponent,
    LatestPosts,
    TooltipDirective,
    AvatarComponent,
    CardComponent,
    BadgeComponent,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly stack: StackTechnology[] = [
    { name: 'Angular', url: 'https://angular.dev' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
    { name: 'RxJS', url: 'https://rxjs.dev' },
    { name: 'Signals API', url: 'https://angular.dev/guide/signals' },
  ];

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
