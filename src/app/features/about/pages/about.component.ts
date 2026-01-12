import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SocialConnectComponent } from '../components/social-connect/social-connect.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SocialConnectComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
