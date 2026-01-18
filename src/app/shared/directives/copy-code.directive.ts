import {
  Directive,
  ElementRef,
  inject,
  Renderer2,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { Icons } from '../components/svg/svg.config';
import { ToastService } from '../components/toast-container/toast.service';
import { ToastType } from '../components/toast/toast.types';

@Directive({
  selector: '[ngCopyCode]',
  standalone: true,
})
export class CopyCodeDirective {
  private readonly _el = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _toastService = inject(ToastService);

  private _observer?: MutationObserver;
  private readonly _basePath = 'assets/images';

  constructor() {
    afterNextRender(() => {
      this._initObserver();
    });
  }

  private _initObserver(): void {
    this._observer = new MutationObserver(() => {
      this._addCopyButtons();
    });

    this._observer.observe(this._el.nativeElement, {
      childList: true,
      subtree: true,
    });

    this._addCopyButtons();

    this._destroyRef.onDestroy(() => {
      this._observer?.disconnect();
    });
  }

  private _addCopyButtons(): void {
    const codeBlocks = this._el.nativeElement.querySelectorAll('pre code');

    codeBlocks.forEach((block: HTMLElement) => {
      const pre = block.parentElement;
      if (!pre || pre.querySelector('.copy-btn')) return;

      this._loadSvgIcon(pre, block, Icons.Copy);
      this._renderer.setStyle(pre, 'position', 'relative');
    });
  }

  private _loadSvgIcon(pre: HTMLElement, codeBlock: HTMLElement, iconName: string): void {
    const iconPath = `${this._basePath}/${iconName}.svg`;

    fetch(iconPath)
      .then((response) => response.text())
      .then((svgContent) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (svgElement) {
          this._renderer.addClass(svgElement, 'copy-btn');


          this._renderer.listen(svgElement, 'click', () => {
            const code = codeBlock.textContent || '';
            navigator.clipboard.writeText(code).then(() => {
              this._toastService.add({
                type: ToastType.Success,
                header: 'Copied!',
                message: 'Code copied to clipboard',
              });
            });
          });

          this._renderer.listen(svgElement, 'keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const code = codeBlock.textContent || '';
              navigator.clipboard.writeText(code).then(() => {
                this._toastService.add({
                  type: ToastType.Success,
                  header: 'Copied!',
                  message: 'Code copied to clipboard',
                });
              });
            }
          });

          this._renderer.appendChild(pre, svgElement);
        }
      })
      .catch((error) => {
        console.error('Failed to load SVG icon:', error);
      });
  }
}
