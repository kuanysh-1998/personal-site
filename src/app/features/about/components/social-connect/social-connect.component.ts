import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-social-connect',
  imports: [],
  templateUrl: './social-connect.component.html',
  styleUrl: './social-connect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialConnectComponent {
  protected readonly links = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/kuanyshaptaizhanov/' },
    { name: 'GitHub', url: 'https://github.com/kuanysh-1998' },
    { name: 'Telegram', url: 'https://t.me/Kuanysh_Aptaizhanov' },
    { name: 'Instagram', url: 'https://www.instagram.com/kuanysh_aptaizhanov/' },
  ];

  protected readonly email = 'kuanysh.aptayzhanov@mail.ru';
}
