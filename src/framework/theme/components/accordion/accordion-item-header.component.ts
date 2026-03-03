/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NbIconModule } from '../icon/icon.module';
import { NbAccordionItemComponent } from './accordion-item.component';

/**
 * Component intended to be used within `<nb-accordion-item>` component
 */
@Component({
  selector: 'nb-accordion-item-header',
  styleUrls: ['./accordion-item-header.component.scss'],
  template: `
    <ng-content select="nb-accordion-item-title"></ng-content>
    <ng-content select="nb-accordion-item-description"></ng-content>
    <ng-content></ng-content>
    @if (!accordionItem.disabled()) {
    <nb-icon
      icon="chevron-down-outline"
      pack="nebular-essentials"
      [@expansionIndicator]="state"
      class="expansion-indicator"
    >
    </nb-icon>
    }
  `,
  animations: [
    trigger('expansionIndicator', [
      state(
        'expanded',
        style({
          transform: 'rotate(180deg)',
        }),
      ),
      transition('collapsed => expanded', animate('100ms ease-in')),
      transition('expanded => collapsed', animate('100ms ease-out')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NbIconModule],
  host: {
    '[class.accordion-item-header-collapsed]': 'accordionItem.collapsed()',
    '[class.accordion-item-header-expanded]': '!accordionItem.collapsed()',
    '[attr.aria-expanded]': '!accordionItem.collapsed()',
    '[attr.tabindex]': 'accordionItem.disabled() ? "-1" : "0"',
    '[attr.aria-disabled]': 'accordionItem.disabled()',
    '(click)': 'toggle()',
    '(keydown.space)': 'toggle()',
    '(keydown.enter)': 'toggle()',
  },
})
export class NbAccordionItemHeaderComponent {
  protected readonly accordionItem = inject(NbAccordionItemComponent, { host: true });

  public toggle() {
    this.accordionItem.toggle();
  }

  public get state(): string {
    return this.accordionItem.collapsed() ? 'collapsed' : 'expanded';
  }
}
