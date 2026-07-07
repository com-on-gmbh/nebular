/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  Input,
  model,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NbAccordionComponent } from './accordion.component';

/**
 * Component intended to be used within `<nb-accordion>` component
 */
@Component({
  selector: 'nb-accordion-item',
  styleUrls: ['./accordion-item.component.scss'],
  template: `
    <ng-content select="nb-accordion-item-header"></ng-content>
    <ng-content select="nb-accordion-item-body"></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  host: {
    '[class.collapsed]': 'collapsed()',
    '[class.expanded]': '!collapsed()',
    '[class.disabled]': 'disabled()',
  },
})
export class NbAccordionItemComponent implements OnInit, OnDestroy {
  /**
   * Item is collapse (`true` by default)
   * @type {boolean}
   */
  public collapsed = model(true);

  /**
   * Item is expanded (`false` by default)
   * @type {boolean}
   */
  @Input()
  public set expanded(val: boolean) {
    this.collapsed.set(!booleanAttribute(val));
  }

  /**
   * Item is disabled and cannot be opened.
   * @type {boolean}
   */
  public disabled = input(false, { transform: booleanAttribute });

  protected readonly accordion = inject(NbAccordionComponent, { host: true });
  private readonly destroy$ = new Subject<void>();

  /**
   * Open/close the item
   */
  public toggle() {
    if (!this.disabled()) {
      const willSet = !this.collapsed();

      if (!this.accordion.multi()) {
        this.accordion.openCloseItems.next(true);
      }
      this.collapsed.set(willSet);
    }
  }

  /**
   * Open the item.
   */
  public open() {
    if (!this.disabled()) {
      this.collapsed.set(false);
    }
  }

  /**
   * Collapse the item.
   */
  public close() {
    if (!this.disabled()) {
      this.collapsed.set(true);
    }
  }

  public ngOnInit() {
    this.accordion.openCloseItems.pipe(takeUntil(this.destroy$)).subscribe((collapsed) => {
      if (!this.disabled()) {
        this.collapsed.set(collapsed);
      }
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
