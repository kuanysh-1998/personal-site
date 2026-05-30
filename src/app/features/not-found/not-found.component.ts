import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { LinkComponent } from '@app/shared/components/link/link.component';
import { SeoService } from '@app/core/services/seo/seo.service';
import { PostService } from '@app/entities/post/services/post.service';
import { PostMetadata } from '@app/entities/post/models/post.interface';

@Component({
  selector: 'app-not-found',
  imports: [TranslocoModule, ButtonComponent, LinkComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _transloco = inject(TranslocoService);
  private readonly _seo = inject(SeoService);
  private readonly _postService = inject(PostService);

  protected readonly recentPosts: PostMetadata[] = this._postService.getAllPosts().slice(0, 3);

  public ngOnInit(): void {
    this._seo.update({
      title: this._transloco.translate('Page not found'),
    });
  }

  protected goToBlog(): void {
    this._router.navigate(['/blog']);
  }
}
