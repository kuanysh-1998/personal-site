import { Component, Input, Renderer2, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'ng-overlay',
  template: '',
  standalone: false,
})
export abstract class Overlay {
  protected abstract close(): void;

  @Input() public offset = 0;
  @Input() public position = 'bottom left';

  protected popoverElement: HTMLElement | undefined;
  protected targetElement: HTMLElement | undefined;

  protected scrollListeners: Array<() => void> = [];

  private readonly _two = 2;
  private readonly _gap = 5;

  constructor(public readonly renderer: Renderer2, public readonly vcr: ViewContainerRef) {}

  public setPosition(): void {
    if (!this.targetElement || !this.popoverElement) {
      return;
    }

    const targetRect = this.targetElement.getBoundingClientRect();
    const popoverRect = this.popoverElement.getBoundingClientRect();

    let top: number | null = null;
    let left: number | null = null;
    let bottom: number | null = null;
    let right: number | null = null;
    let maxHeight: number | null = null;
    let maxWidth: number | null = null;

    const scrollWidth =
      document.documentElement.scrollHeight > document.documentElement.clientHeight ? 4 : 0;

    const spaceTop = targetRect.top - this.offset - this._gap;
    const spaceBottom = window.innerHeight - targetRect.bottom - this.offset - this._gap;
    const spaceLeft = targetRect.left - this.offset - this._gap;
    const spaceRight = window.innerWidth - targetRect.right - this.offset - this._gap - scrollWidth;

    const center = {
      horizontal: targetRect.left + targetRect.width / this._two - popoverRect.width / this._two,
      vertical: targetRect.top + targetRect.height / this._two - popoverRect.height / this._two,
    };

    switch (this.position) {
      case 'top left':
        if (spaceTop >= popoverRect.height || spaceTop >= spaceBottom) {
          bottom = window.innerHeight - targetRect.top + this.offset;
          left = targetRect.left;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          top = targetRect.bottom + this.offset;
          left = targetRect.left;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        break;

      case 'top':
        if (spaceTop >= popoverRect.height || spaceTop >= spaceBottom) {
          bottom = window.innerHeight - targetRect.top + this.offset;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          top = targetRect.bottom + this.offset;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        left = center.horizontal;
        break;

      case 'top right':
        if (spaceTop >= popoverRect.height || spaceTop >= spaceBottom) {
          bottom = window.innerHeight - targetRect.top + this.offset;
          right = window.innerWidth - targetRect.right;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          top = targetRect.bottom + this.offset;
          right = window.innerWidth - targetRect.right;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        break;

      case 'bottom left':
        if (spaceBottom >= popoverRect.height || spaceTop <= spaceBottom) {
          top = targetRect.bottom + this.offset;
          left = targetRect.left;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          bottom = window.innerHeight - targetRect.top + this.offset;
          left = targetRect.left;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        break;

      case 'bottom':
        if (spaceBottom >= popoverRect.height || spaceTop <= spaceBottom) {
          top = targetRect.bottom + this.offset;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          bottom = window.innerHeight - targetRect.top + this.offset;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        left = center.horizontal;
        break;

      case 'bottom right':
        if (spaceBottom >= popoverRect.height || spaceTop <= spaceBottom) {
          top = targetRect.bottom + this.offset;
          right = window.innerWidth - targetRect.right;
          maxHeight = spaceBottom;
          maxWidth = window.innerWidth - this._gap * this._two;
        } else {
          bottom = window.innerHeight - targetRect.top + this.offset;
          right = window.innerWidth - targetRect.right;
          maxHeight = spaceTop;
          maxWidth = window.innerWidth - this._gap * this._two;
        }
        break;

      case 'left top':
        if (spaceLeft >= popoverRect.width || spaceLeft >= spaceRight) {
          bottom = window.innerHeight - targetRect.top - popoverRect.height;
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        } else {
          bottom = window.innerHeight - targetRect.top - popoverRect.height;
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        }
        break;

      case 'left':
        if (spaceLeft >= popoverRect.width || spaceLeft >= spaceRight) {
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        } else {
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        }
        top = center.vertical;
        break;

      case 'left bottom':
        if (spaceLeft >= popoverRect.width || spaceLeft >= spaceRight) {
          top = targetRect.bottom - popoverRect.height;
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        } else {
          top = targetRect.bottom - popoverRect.height;
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        }
        break;

      case 'right top':
        if (spaceRight >= popoverRect.width || spaceRight >= spaceLeft) {
          bottom = window.innerHeight - targetRect.top - popoverRect.height;
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        } else {
          bottom = window.innerHeight - targetRect.top - popoverRect.height;
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        }
        break;

      case 'right':
        if (spaceRight >= popoverRect.width || spaceRight >= spaceLeft) {
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        } else {
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        }
        top = center.vertical;
        break;

      case 'right bottom':
        if (spaceRight >= popoverRect.width || spaceRight >= spaceLeft) {
          top = targetRect.bottom - popoverRect.height;
          left = targetRect.right + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceRight;
        } else {
          top = targetRect.bottom - popoverRect.height;
          right = window.innerWidth - targetRect.left + this.offset;
          maxHeight = window.innerHeight - this._gap * this._two;
          maxWidth = spaceLeft;
        }
        break;
    }

    this.renderer.setStyle(this.popoverElement, 'max-height', `${maxHeight}px`);
    this.renderer.setStyle(this.popoverElement, 'max-width', `${maxWidth}px`);

    if (left !== null) {
      if (left < this._gap) {
        left = this._gap;
      } else if (left + popoverRect.width + this._gap > window.innerWidth) {
        left = window.innerWidth - Math.min(popoverRect.width, maxWidth ?? 0) - this._gap;
      }
    }

    if (top !== null) {
      if (top < this._gap) {
        top = this._gap;
      } else if (top + popoverRect.height > window.innerHeight) {
        top = window.innerHeight - Math.min(popoverRect.height, maxHeight ?? 0) - this._gap;
      }
    }

    if (right !== null) {
      if (right < this._gap) {
        right = this._gap;
      } else if (right + popoverRect.width > window.innerWidth) {
        right = window.innerWidth - Math.min(popoverRect.width, maxWidth ?? 0) - this._gap;
      }
    }

    if (bottom !== null) {
      if (bottom < this._gap) {
        bottom = this._gap;
      } else if (bottom + popoverRect.height > window.innerHeight) {
        bottom = window.innerHeight - Math.min(popoverRect.height, maxHeight ?? 0) - this._gap;
      }
    }

    if (this.popoverElement.classList.contains('ng-tooltip')) {
      if (
        this.position === 'bottom right' ||
        this.position === 'bottom left' ||
        this.position === 'top right' ||
        this.position === 'top left'
      ) {
        if (left && popoverRect.width < targetRect.width / 2 + 12) {
          left = left + targetRect.width / 2 - popoverRect.width + this._gap * 2;
        }

        if (right && popoverRect.width < targetRect.width / 2 + 12) {
          right = right + targetRect.width / 2 - popoverRect.width + this._gap * 2;
        }
      }

      if (
        this.position === 'right bottom' ||
        this.position === 'right top' ||
        this.position === 'left bottom' ||
        this.position === 'left top'
      ) {
        if (top && popoverRect.height < targetRect.height / 2 + 12) {
          top = top - targetRect.height / 2 + popoverRect.height - this._gap * 2;
        }

        if (bottom && popoverRect.height < targetRect.height / 2 + 12) {
          bottom = bottom - targetRect.height / 2 + popoverRect.height - this._gap * 2;
        }
      }
    }

    if (right !== null) {
      this.renderer.setStyle(this.popoverElement, 'right', `${right}px`);
    }

    if (bottom !== null) {
      this.renderer.setStyle(this.popoverElement, 'bottom', `${bottom}px`);
    }

    if (top !== null) {
      this.renderer.setStyle(this.popoverElement, 'top', `${top}px`);
    }

    if (left !== null) {
      this.renderer.setStyle(this.popoverElement, 'left', `${left}px`);
    }

    const arrow = this.popoverElement.querySelector('.ng-tooltip__arrow') as HTMLElement;

    if (arrow) {
      if (this.position.startsWith('top') || this.position.startsWith('bottom')) {
        if (top) this.renderer.addClass(this.popoverElement, 'ng-tooltip_bottom');
        if (bottom) this.renderer.addClass(this.popoverElement, 'ng-tooltip_top');

        this.renderer.setStyle(
          arrow,
          'left',
          `${
            targetRect.left +
            targetRect.width / this._two -
            this.popoverElement.getBoundingClientRect().left
          }px`
        );
      } else {
        if (right) this.renderer.addClass(this.popoverElement, 'ng-tooltip_left');
        if (left) this.renderer.addClass(this.popoverElement, 'ng-tooltip_right');

        this.renderer.setStyle(
          arrow,
          'top',
          `${
            targetRect.top +
            targetRect.height / this._two -
            this.popoverElement.getBoundingClientRect().top -
            12
          }px`
        );
      }
    }
  }

  protected addScrollListeners(): void {
    let element: HTMLElement | undefined = this.targetElement;
    let parentLevel = 0;

    while (element) {
      const overflowY = window.getComputedStyle(element).overflowY;
      const overflowX = window.getComputedStyle(element).overflowX;
      const isScrollable =
        overflowY === 'scroll' ||
        overflowY === 'auto' ||
        overflowX === 'scroll' ||
        overflowX === 'auto';

      if (isScrollable) {
        const currentElement = element;
        const listener = () => {
          this.close();
        };
        currentElement.addEventListener('scroll', listener);
        this.scrollListeners.push(() => {
          currentElement.removeEventListener('scroll', listener);
        });
      }
      element = element.parentElement as HTMLElement | undefined;
      parentLevel++;
    }

    const windowScrollListener = (event: Event): void => {
      if (!this.popoverElement) return;

      const overlayContent = this.popoverElement.querySelector(
        '.ng-popover__content'
      ) as HTMLElement | null;

      const eventTargetNode = event.target as Node;
      const isInput =
        eventTargetNode instanceof HTMLElement &&
        eventTargetNode.tagName?.toLowerCase() === 'input';
      const inOverlayContent = overlayContent && overlayContent.contains(eventTargetNode);

      const targetIsPageScroll =
        eventTargetNode === document ||
        eventTargetNode === document.documentElement ||
        eventTargetNode === document.body;

      if (overlayContent && !inOverlayContent && !isInput && targetIsPageScroll) {
        this.close();
      } else if (!overlayContent && !isInput && targetIsPageScroll) {
        this.close();
      }
    };

    window.addEventListener('scroll', windowScrollListener, true);
    this.scrollListeners.push(() => {
      window.removeEventListener('scroll', windowScrollListener, true);
    });
  }
  protected removeScrollListeners(): void {
    this.scrollListeners.forEach((removeListener) => removeListener());
    this.scrollListeners = [];
  }

  protected isInsideDialogOrDrawer(): boolean {
    let element: HTMLElement | undefined = this.targetElement;

    while (element) {
      if (
        element.classList.contains('ng-dialog__container') ||
        element.classList.contains('ng-drawer__container')
      ) {
        return true;
      }
      element = element.parentElement as HTMLElement;
    }

    return false;
  }
}
