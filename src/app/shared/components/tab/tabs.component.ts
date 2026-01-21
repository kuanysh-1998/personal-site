import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  signal,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { Tab } from './tabs.types';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'ng-tabs',
  imports: [CommonModule, SvgComponent],
  templateUrl: './tabs.component.html',
  styleUrls: ['./styles/tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) public tabsItems: Tab[] = [];
  @Input() public orientation: 'horizontal' | 'vertical' | 'auto' = 'auto';
  @Input() public disabled = false;
  @Input() public token = undefined;
  @Input() public manualTabControl = false;
  @Input() public hideBorder = false;

  @Output() public changed = new EventEmitter<Tab>();

  @ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<any>>;

  protected indicatorState = signal({ left: 0, width: 0, top: 0, height: 0 });
  protected isMobile = signal(false);

  private readonly _selectedTab = signal<string | null>(null);
  private _mediaQueryList!: MediaQueryList;

  @ViewChildren('tabTmpl') private readonly _tabsTmpl!: QueryList<ElementRef<HTMLDivElement>>;

  @ViewChild('indicator', { static: true })
  private readonly _indicator!: ElementRef<HTMLDivElement>;

  @Input()
  public set selectedTab(value: string) {
    this._selectedTab.set(value);
    setTimeout(() => {
      this._moveIndicatorToTab(this.tabsItems.find((i) => i.id === value));
      this._cdr.markForCheck();
    }, 100);
  }

  public get selectedTab(): number | string | null {
    return this._selectedTab();
  }

  protected get isVerticalTabs(): boolean {
    return this.getEffectiveOrientation() === 'vertical';
  }

  private getEffectiveOrientation(): 'horizontal' | 'vertical' {
    if (this.orientation === 'auto') {
      return this.isMobile() ? 'vertical' : 'horizontal';
    }
    return this.orientation;
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {
    this._initMediaQuery();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this._moveIndicatorToTab(this.tabsItems.find((i) => i.id === this._selectedTab()));
      this._cdr.markForCheck();
    }, 100);
  }

  public ngOnDestroy(): void {
    if (this._mediaQueryList) {
      this._mediaQueryList.removeEventListener('change', this._handleMediaQueryChange);
    }
  }

  private _initMediaQuery(): void {
    if (typeof window !== 'undefined') {
      this._mediaQueryList = window.matchMedia('(max-width: 767px)');
      this.isMobile.set(this._mediaQueryList.matches);
      this._mediaQueryList.addEventListener('change', this._handleMediaQueryChange);
    }
  }

  private _handleMediaQueryChange = (event: MediaQueryListEvent): void => {
    this.isMobile.set(event.matches);
    this._cdr.markForCheck();

    setTimeout(() => {
      this._moveIndicatorToTab(this.tabsItems.find((i) => i.id === this._selectedTab()));
    }, 100);
  };

  public changeTab(tab: Tab): void {
    if (this.disabled || tab.disabled) return;

    if (this.selectedTab === tab.id) return;

    this.changed.emit(tab);

    if (this.manualTabControl) return;

    this._selectedTab.set(tab.id);
    this._moveIndicatorToTab(tab);
  }

  public updateIndicatorPosition(): void {
    setTimeout(() => {
      this._moveIndicatorToTab(this.tabsItems.find((i) => i.id === this._selectedTab()));
      this._cdr.markForCheck();
    }, 50);
  }

  protected getTabClasses(tab: Tab): { [key: string]: boolean } {
    return {
      'ng-tabs__tab_disabled': !!(this.disabled || tab.disabled),
      'ng-tabs__tab_selected': this.selectedTab === tab.id,
      'ng-tabs__tab_hidden': tab.visible === false,
      'ng-tabs__tab_vertical': this.isVerticalTabs,
      'ng-tabs__tab': true,
    };
  }

  private _moveIndicatorToTab(tab?: Tab): void {
    const effectiveOrientation = this.getEffectiveOrientation();

    if (effectiveOrientation === 'vertical') {
      this._moveIndicatorToTabVertical(tab);
    } else {
      this._moveIndicatorToTabHorizontal(tab);
    }

    this._applyIndicatorStyles();
  }

  private _moveIndicatorToTabVertical(tab?: Tab): void {
    const tabElement = this._tabsTmpl
      ?.toArray()
      .find((i) => i.nativeElement.id === tab?.id)?.nativeElement;
    if (!tabElement || !tabElement.offsetParent) return;

    const PADDING = 2;
    const tabTop = tabElement.offsetTop;
    const tabHeight = tabElement.offsetHeight;

    if (tab?.visible === false) {
      this.indicatorState.update((state) => ({
        ...state,
        top: 0,
        height: 0,
      }));
    } else {
      this.indicatorState.update((state) => ({
        ...state,
        top: tabTop + PADDING,
        height: tabHeight - 2 * PADDING,
      }));
    }
  }

  private _moveIndicatorToTabHorizontal(tab?: Tab): void {
    const tabElement = this._tabsTmpl
      ?.toArray()
      .find((i) => i.nativeElement.id === tab?.id)?.nativeElement;
    if (!tabElement || !tabElement.offsetParent) return;

    const tabRect = tabElement.getBoundingClientRect();
    const containerRect = tabElement.offsetParent!.getBoundingClientRect();

    const tabLeft = tabRect.left - containerRect.left;
    const tabWidth = tabRect.width;

    if (tabWidth === 0) {
      requestAnimationFrame(() => {
        this._moveIndicatorToTab(tab);
      });
      return;
    }

    if (tab?.visible === false) {
      this.indicatorState.update((state) => ({
        ...state,
        left: 0,
        width: 0,
      }));
    } else {
      this.indicatorState.update((state) => ({
        ...state,
        left: tabLeft,
        width: tabWidth,
      }));
    }
  }

  private _applyIndicatorStyles(): void {
    const indicatorElement = this._indicator.nativeElement;
    const state = this.indicatorState();
    const effectiveOrientation = this.getEffectiveOrientation();

    if (effectiveOrientation === 'vertical') {
      indicatorElement.style.top = `${state.top}px`;
      indicatorElement.style.height = `${state.height}px`;
      indicatorElement.style.left = '0px';
      indicatorElement.style.width = '3px';
      indicatorElement.style.bottom = 'auto';
    } else {
      indicatorElement.style.left = `${state.left}px`;
      indicatorElement.style.width = `${state.width}px`;
      indicatorElement.style.top = 'auto';
      indicatorElement.style.height = '2px';
      indicatorElement.style.bottom = '-2px';
    }

    indicatorElement.style.backgroundColor = '';
  }
}
