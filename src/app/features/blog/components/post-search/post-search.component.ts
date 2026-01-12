import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgComponent } from '@app/shared/components/svg/svg.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { Icons } from '@app/shared/components/svg/svg.config';

@Component({
  selector: 'app-post-search',
  standalone: true,
  imports: [FormsModule, SvgComponent, ButtonComponent],
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

  protected onInputChange(value: string): void {
    this.searchValue.set(value);
    this.searchChange.emit(value);
  }

  protected onClear(): void {
    this.searchValue.set('');
    this.clear.emit();
  }

  protected get hasValue(): boolean {
    return this.searchValue().length > 0;
  }
}
