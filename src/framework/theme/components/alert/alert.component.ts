/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, booleanAttribute, inject, input, output } from '@angular/core';

import { NbStatusService } from '../../services/status.service';
import { NbComponentSize } from '../component-size';
import { NbComponentOrCustomStatus, NbComponentStatus } from '../component-status';

/**
 * Alert component.
 *
 * Basic alert example:
 * @stacked-example(Showcase, alert/alert-showcase.component)
 *
 * Alert configuration:
 *
 * ```html
 * <nb-alert status="success">
 *   You have been successfully authenticated!
 * </nb-alert>
 * ```
 * ### Installation
 *
 * Standalone (recommended):
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [
 *     // ...
 *     NbAlertComponent,
 *   ],
 * })
 * export class MyComponent { }
 * ```
 *
 * NgModule (legacy):
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbAlertModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Alert could additionally have a `close` button when `closable` property is set:
 * ```html
 * <nb-alert status="success" closable (close)="onClose()">
 *   You have been successfully authenticated!
 * </nb-alert>
 * ```
 *
 * Colored alerts could be simply configured by providing a `status` property:
 * @stacked-example(Alert status, alert/alert-colors.component)
 *
 * It is also possible to assign an `accent` property for a slight alert highlight
 * as well as combine it with `status`:
 * @stacked-example(Alert accent, alert/alert-accents.component)
 *
 * And `outline` property:
 * @stacked-example(Outline Alert, alert/alert-outline.component)
 *
 * @additional-example(Multiple Sizes, alert/alert-sizes.component)
 *
 * @styles
 *
 * alert-border-radius:
 * alert-bottom-margin:
 * alert-padding:
 * alert-scrollbar-color:
 * alert-scrollbar-background-color:
 * alert-scrollbar-width:
 * alert-shadow:
 * alert-text-font-family:
 * alert-text-font-size:
 * alert-text-font-weight:
 * alert-text-line-height:
 * alert-closable-start-padding:
 * alert-tiny-height:
 * alert-small-height:
 * alert-medium-height:
 * alert-medium-padding:
 * alert-large-height:
 * alert-giant-height:
 * alert-basic-background-color:
 * alert-basic-text-color:
 * alert-primary-background-color:
 * alert-primary-text-color:
 * alert-success-background-color:
 * alert-success-text-color:
 * alert-info-background-color:
 * alert-info-text-color:
 * alert-warning-background-color:
 * alert-warning-text-color:
 * alert-danger-background-color:
 * alert-danger-text-color:
 * alert-control-background-color:
 * alert-control-text-color:
 * alert-accent-basic-color:
 * alert-accent-primary-color:
 * alert-accent-info-color:
 * alert-accent-success-color:
 * alert-accent-warning-color:
 * alert-accent-danger-color:
 * alert-accent-control-color:
 * alert-outline-width:
 * alert-outline-basic-color:
 * alert-outline-primary-color:
 * alert-outline-info-color:
 * alert-outline-success-color:
 * alert-outline-warning-color:
 * alert-outline-danger-color:
 * alert-outline-control-color:
 */
@Component({
  selector: 'nb-alert',
  standalone: true,
  imports: [],
  styleUrls: ['./alert.component.scss'],
  template: `
    @if (closable()) {
    <button type="button" class="close" aria-label="Close" (click)="onClose()">
      <span aria-hidden="true">&times;</span>
    </button>
    }
    <ng-content></ng-content>
  `,
  host: {
    '[class.closable]': 'closable()',
    '[class.size-tiny]': 'size() === "tiny"',
    '[class.size-small]': 'size() === "small"',
    '[class.size-medium]': 'size() === "medium"',
    '[class.size-large]': 'size() === "large"',
    '[class.size-giant]': 'size() === "giant"',
    '[class.status-primary]': 'status() === "primary"',
    '[class.status-success]': 'status() === "success"',
    '[class.status-info]': 'status() === "info"',
    '[class.status-warning]': 'status() === "warning"',
    '[class.status-danger]': 'status() === "danger"',
    '[class.status-basic]': 'status() === "basic"',
    '[class.status-control]': 'status() === "control"',
    '[class.accent-primary]': 'accent() === "primary"',
    '[class.accent-success]': 'accent() === "success"',
    '[class.accent-info]': 'accent() === "info"',
    '[class.accent-warning]': 'accent() === "warning"',
    '[class.accent-danger]': 'accent() === "danger"',
    '[class.accent-basic]': 'accent() === "basic"',
    '[class.accent-control]': 'accent() === "control"',
    '[class.outline-primary]': 'outline() === "primary"',
    '[class.outline-success]': 'outline() === "success"',
    '[class.outline-info]': 'outline() === "info"',
    '[class.outline-warning]': 'outline() === "warning"',
    '[class.outline-danger]': 'outline() === "danger"',
    '[class.outline-basic]': 'outline() === "basic"',
    '[class.outline-control]': 'outline() === "control"',
    '[class]': 'additionalClasses',
  },
})
export class NbAlertComponent {
  /**
   * Alert size, available sizes:
   * `tiny`, `small`, `medium`, `large`, `giant`
   * Unset by default.
   */
  public size = input<'' | NbComponentSize>('');

  /**
   * Alert status (adds specific styles):
   * `basic` (default), `primary`, `success`, `info`, `warning`, `danger`, `control`.
   */
  public status = input<NbComponentOrCustomStatus>('basic');

  /**
   * Alert accent (color of the top border):
   * `basic`, `primary`, `success`, `info`, `warning`, `danger`, `control`.
   * Unset by default.
   */
  public accent = input<'' | NbComponentStatus>('');

  /**
   * Alert outline (color of the border):
   * `basic`, `primary`, `success`, `info`, `warning`, `danger`, `control`.
   * Unset by default.
   */
  public outline = input<'' | NbComponentStatus>('');

  /**
   * Shows `close` icon
   */
  public closable = input(false, { transform: booleanAttribute });

  /**
   * Emits when chip is removed
   * @type EventEmitter<any>
   */
  public close = output<void>();

  protected statusService = inject(NbStatusService);

  /**
   * Emits the removed chip event
   */
  public onClose(): void {
    this.close.emit();
  }

  public get additionalClasses(): string[] {
    if (this.statusService.isCustomStatus(this.status())) {
      return [this.statusService.getStatusClass(this.status())];
    }
    return [];
  }
}
