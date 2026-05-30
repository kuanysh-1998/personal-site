import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { LinkComponent } from '@app/shared/components/link/link.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { SocialLink } from './social-connect.types';

@Component({
  selector: 'app-social-connect',
  imports: [TranslocoModule, LinkComponent],
  templateUrl: './social-connect.component.html',
  styleUrl: './social-connect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialConnectComponent {
  protected readonly email = 'kuanysh.aptayzhanov@mail.ru';

  protected readonly links: SocialLink[] = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/kuanyshaptaizhanov/',
      icon: Icons.LinkedIn,
    },
    { name: 'GitHub', url: 'https://github.com/kuanysh-1998', icon: Icons.GitHub },
    { name: 'Telegram', url: 'https://t.me/Kuanysh_Aptaizhanov', icon: Icons.Telegram },
    { name: 'Strava', url: 'https://www.strava.com/athletes/139625244', icon: Icons.Strava },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/kuanysh_aptaizhanov/',
      icon: Icons.Instagram,
    },
  ];
}
