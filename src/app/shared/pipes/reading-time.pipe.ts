import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { calculateReadingTime } from '../utils/reading-time.util';

@Pipe({
  name: 'readingTime',
  standalone: true,
})
export class ReadingTimePipe implements PipeTransform {
  private readonly _transloco = inject(TranslocoService);

  public transform(content: string | null | undefined): string {
    if (!content) {
      return this._transloco.translate('1 min read');
    }

    const minutes = calculateReadingTime(content);

    if (minutes === 1) {
      return this._transloco.translate('1 min read');
    }

    return this._transloco.translate('{{minutes}} min read', { minutes });
  }
}
