import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { TextFieldComponent } from '@app/shared/components/text-field/text-field.component';
import { Icons } from '@app/shared/components/svg/svg.config';

@Component({
  selector: 'app-post-search',
  imports: [TextFieldComponent],
  templateUrl: './post-search.component.html',
  styleUrl: './post-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSearchComponent {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _searchSubject = new Subject<string>();

  protected readonly SearchIcon = Icons.Search;
  protected readonly CloseIcon = Icons.Close;

  @Input() placeholder = 'Search posts...';
  @Input() ariaLabel = 'Search posts';
  @Input() minSearchLength = 3;
  @Input() debounceTime = 300;

  @Output() searchChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  protected readonly searchValue = signal<string>('');

  protected readonly hasValue = computed(() => this.searchValue().length > 0);

  constructor() {
    this._searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        filter((value) => value.length === 0 || value.length >= this.minSearchLength),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value) => {
        this.searchChange.emit(value);
        this._cdr.markForCheck();
      });
  }

  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this._cdr.markForCheck();
    this._searchSubject.next(value);
  }

  protected onClear(): void {
    this.searchValue.set('');
    this._cdr.markForCheck();
    this.clear.emit();
    this.searchChange.emit('');
    this._searchSubject.next('');
  }
}
