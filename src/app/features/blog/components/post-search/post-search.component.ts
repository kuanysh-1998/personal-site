import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
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
  protected readonly SearchIcon = Icons.Search;
  protected readonly CloseIcon = Icons.Close;

  @Input() placeholder = 'Search posts...';
  @Input() ariaLabel = 'Search posts';

  @Output() searchChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  protected readonly searchValue = signal<string>('');

  protected readonly hasValue = computed(() => this.searchValue().length > 0);

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this._cdr.markForCheck();
    this.searchChange.emit(value);
  }

  protected onClear(): void {
    this.searchValue.set('');
    this._cdr.markForCheck();
    this.clear.emit();
    this.searchChange.emit('');
  }
}
