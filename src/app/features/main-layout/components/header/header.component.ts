import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { DrawerService } from '@app/shared/components/drawer/drawer.service';
import { WhatsNewComponent } from '@app/features/whats-new/whats-new.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly _drawerService = inject(DrawerService);

  protected openWhatsNew(): void {
    const drawerRef = this._drawerService.open(WhatsNewComponent, {
      header: "What's New",
      customWidth: '500px',
      additionalButton: 'Close',
    });

    drawerRef.additionalAction.pipe(take(1)).subscribe(() => {
      drawerRef.close();
    });
  }
}
