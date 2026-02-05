import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { PopoverPosition } from '../popover/popover.types';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[ngTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnInit, OnDestroy, OnChanges {
  @Input('ngTooltip') public content: string | TemplateRef<unknown> | undefined = undefined;
  @Input('ngTooltipPosition') public position: PopoverPosition = 'top';

  private _tooltipComponentRef: ComponentRef<TooltipComponent> | null = null;
  private _embeddedViewRef: EmbeddedViewRef<unknown> | null = null;

  constructor(
    private readonly _templateRef: TemplateRef<unknown>,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && this._tooltipComponentRef && this.content !== undefined) {
      this._tooltipComponentRef.instance.content = this.content;
      this._tooltipComponentRef.injector.get(ChangeDetectorRef).markForCheck();
    }
  }

  public ngOnInit(): void {
    if (this.content) {
      this._createTooltip(this.content);
    }
  }

  public ngOnDestroy(): void {
    this._destroyTooltip();
  }

  private _createTooltip(content: string | TemplateRef<unknown>): void {
    this._destroyTooltip();

    this._embeddedViewRef = this._viewContainerRef.createEmbeddedView(this._templateRef);
    this._tooltipComponentRef = this._viewContainerRef.createComponent(TooltipComponent);

    this._tooltipComponentRef.instance.content = content;
    this._tooltipComponentRef.instance.position = this.position;
    this._tooltipComponentRef.instance.for = this._embeddedViewRef.rootNodes[0];
  }

  private _destroyTooltip(): void {
    if (this._tooltipComponentRef) {
      this._tooltipComponentRef.destroy();
      this._tooltipComponentRef = null;
    }
    if (this._embeddedViewRef) {
      this._embeddedViewRef.destroy();
      this._embeddedViewRef = null;
    }
  }
}
