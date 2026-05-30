import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { interval } from 'rxjs';
import { SocialConnectComponent } from '../components/social-connect/social-connect.component';
import { LatestPosts } from '@app/features/blog/components/latest-posts/latest-posts';
import { AvatarComponent } from '@app/shared/components/avatar/avatar.component';
import { SvgComponent } from '@app/shared/components/svg/svg.component';
import { Icons } from '@app/shared/components/svg/svg.config';
import { SeoService } from '@app/core/services/seo/seo.service';

@Component({
  selector: 'app-about',
  imports: [TranslocoModule, SocialConnectComponent, LatestPosts, AvatarComponent, SvgComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {
  private readonly _transloco = inject(TranslocoService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _seo = inject(SeoService);

  private readonly _currentLang = signal(this._transloco.getActiveLang());
  private readonly _clockTick = signal(0);

  protected readonly clockIcon = Icons.Clock;

  protected readonly astanaTime = computed(() => {
    this._currentLang();
    this._clockTick();
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const astanaTimeDate = new Date(utcTime + 5 * 3600000);

    const hours = astanaTimeDate.getHours();
    const minutes = astanaTimeDate.getMinutes();
    const ampmKey = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const ampm = this._transloco.translate(ampmKey);

    return `${displayHours}:${displayMinutes} ${ampm}`;
  });

  public ngOnInit(): void {
    interval(30000)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._clockTick.update((v) => v + 1));

    this._updateSeo();
    this._transloco.langChanges$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((lang) => {
      this._currentLang.set(lang);
      this._updateSeo();
    });
  }

  private _updateSeo(): void {
    this._seo.update({
      title: this._transloco.translate('About'),
      description: this._transloco.translate('Frontend engineer in Astana, Kazakhstan'),
      path: '/about',
    });
  }
}
