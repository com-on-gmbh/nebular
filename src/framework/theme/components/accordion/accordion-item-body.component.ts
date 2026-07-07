/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NbAccordionItemComponent } from './accordion-item.component';

const accordionItemBodyTrigger = trigger('accordionItemBody', [
  state(
    'collapsed',
    style({
      overflow: 'hidden',
      visibility: 'hidden',
      height: 0,
    }),
  ),
  state(
    'expanded',
    style({
      overflow: 'hidden',
      visibility: 'visible',
    }),
  ),
  transition('collapsed => expanded', animate('100ms ease-in')),
  transition('expanded => collapsed', animate('100ms ease-out')),
]);

/**
 * Component intended to be used within `<nb-accordion-item>` component
 */
@Component({
  selector: 'nb-accordion-item-body',
  template: `
    <div [@accordionItemBody]="{ value: state }">
      <div class="item-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  animations: [accordionItemBodyTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class NbAccordionItemBodyComponent {
  protected readonly accordionItem = inject(NbAccordionItemComponent, { host: true });

  public get state(): string {
    return this.accordionItem.collapsed() ? 'collapsed' : 'expanded';
  }
}
