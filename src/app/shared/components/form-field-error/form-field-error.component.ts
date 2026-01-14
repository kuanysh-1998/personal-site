import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  DestroyRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { merge, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ng-form-field-error',
  imports: [CommonModule],
  templateUrl: './form-field-error.component.html',
  styleUrl: './form-field-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldErrorComponent implements OnInit, OnChanges {
  @Input() control: AbstractControl | null = null;
  @Input() requiredMessage = 'This field is required';
  @Input() emailMessage = 'Invalid email address';
  @Input() patternMessage = 'Invalid format';

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this._setupControlSubscription();
    this._setupTouchedStateTracking();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['control']) {
      if (!changes['control'].firstChange) {
        this._setupControlSubscription();
      }
      this._setupTouchedStateTracking();
    }
  }

  private _setupControlSubscription(): void {
    if (this.control) {
      merge(this.control.statusChanges, this.control.valueChanges)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._cdr.markForCheck();
        });
    }
  }

  private _setupTouchedStateTracking(): void {
    if (!this.control) {
      return;
    }

    let previousTouchedState = this.control.touched;

    timer(0, 50)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const currentTouchedState = this.control?.touched || false;
        if (currentTouchedState !== previousTouchedState) {
          previousTouchedState = currentTouchedState;
          this._cdr.markForCheck();
        }
      });
  }
}
