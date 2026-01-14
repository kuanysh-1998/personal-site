import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  AfterViewInit,
} from '@angular/core';
import { fromEvent, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reading-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './reading-progress-bar.component.html',
  styleUrl: './reading-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingProgressBarComponent implements AfterViewInit {
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly progress = signal(0);

  public ngAfterViewInit(): void {
    fromEvent(window, 'scroll', { passive: true })
      .pipe(throttleTime(50), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._updateProgress();
      });

    this._updateProgress();
  }

  private _updateProgress(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (docHeight <= 0) {
      this.progress.set(0);
      return;
    }

    const scrollProgress = (scrollTop / docHeight) * 100;
    this.progress.set(Math.min(100, Math.max(0, scrollProgress)));
  }
}
