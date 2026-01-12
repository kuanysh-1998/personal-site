import { Pipe, PipeTransform } from '@angular/core';
import { calculateReadingTime } from '../utils/reading-time.util';

@Pipe({
  name: 'readingTime',
  standalone: true,
})
export class ReadingTimePipe implements PipeTransform {
  public transform(content: string | null | undefined): string {
    if (!content) {
      return '1 min read';
    }

    const minutes = calculateReadingTime(content);

    if (minutes === 1) {
      return '1 min read';
    }

    return `${minutes} min read`;
  }
}
