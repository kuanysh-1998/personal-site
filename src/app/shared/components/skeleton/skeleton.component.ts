import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ng-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonComponent {
  @Input() @HostBinding('style.height') public height = '0px';
  @Input() @HostBinding('style.width') public width = '0px';

  @HostBinding('class.ng-skeleton') protected hostClass = true;
}
