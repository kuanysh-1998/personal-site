import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LinkComponent } from '@app/shared/components/link/link.component';

@Component({
  selector: 'app-social-connect',
  imports: [LinkComponent],
  templateUrl: './social-connect.component.html',
  styleUrl: './social-connect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialConnectComponent {
  protected readonly email = 'kuanysh.aptayzhanov@mail.ru';

  protected readonly links = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/kuanyshaptaizhanov/' },
    { name: 'GitHub', url: 'https://github.com/kuanysh-1998' },
    { name: 'Telegram', url: 'https://t.me/Kuanysh_Aptaizhanov' },
    { name: 'Strava', url: 'https://www.strava.com/athletes/139625244' },
    { name: 'Instagram', url: 'https://www.instagram.com/kuanysh_aptaizhanov/' },
  ];
}
