import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonComponent } from '@app/shared/components/button/button.component';

@Component({
  selector: 'app-not-found',
  imports: [TranslocoModule, ButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly _router = inject(Router);

  protected goToBlog(): void {
    this._router.navigate(['/blog']);
  }
}
