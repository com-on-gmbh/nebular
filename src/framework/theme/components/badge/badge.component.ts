/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, booleanAttribute, inject, input } from '@angular/core';

import { NbStatusService } from '../../services/status.service';
import { NbComponentOrCustomStatus } from '../component-status';

export type NbBadgePhysicalPosition =
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'
  | 'center right'
  | 'center left';
export type NbBadgeLogicalPosition =
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end'
  | 'center start'
  | 'center end';
export type NbBadgePosition = NbBadgePhysicalPosition | NbBadgeLogicalPosition;

export interface NbBadge {
  text?: string;
  position?: NbBadgePosition;
  status?: NbComponentOrCustomStatus;
  dotMode?: boolean;
}

/**
 * Badge is a simple labeling component.
 * It can be used to add additional information to any content or highlight unread items.
 *
 * Element is absolute positioned, so parent should be
 * [positioned element](https://developer.mozilla.org/en-US/docs/Web/CSS/position).
 * It means parent `position` should be set to anything except `static`, e.g. `relative`,
 * `absolute`, `fixed`, or `sticky`.
 *
 * ### Installation
 *
 * Import `NbBadgeModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbBadgeModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Badge with default position and status(color):
 *
 * ```html
 * <nb-badge text="badgeText"></nb-badge>
 * ```
 *
 * For example, badge can be placed into nb-card header:
 * @stacked-example(Showcase, badge/badge-showcase.component)
 *
 * Badge located on the bottom right with warning status:
 *
 * ```html
 * <nb-badge text="badgeText" status="warning" position="bottom right">
 * </nb-badge>
 * ```
 *
 * @styles
 *
 * badge-border-radius:
 * badge-text-font-family:
 * badge-text-font-size:
 * badge-text-font-weight:
 * badge-text-line-height:
 * badge-padding:
 * badge-basic-background-color:
 * badge-basic-text-color:
 * badge-primary-background-color:
 * badge-primary-text-color:
 * badge-success-background-color:
 * badge-success-text-color:
 * badge-info-background-color:
 * badge-info-text-color:
 * badge-warning-background-color:
 * badge-warning-text-color:
 * badge-danger-background-color:
 * badge-danger-text-color:
 * badge-control-background-color:
 * badge-control-text-color:
 */
@Component({
  selector: 'nb-badge',
  styleUrls: ['./badge.component.scss'],
  standalone: true,
  imports: [],
  template: `{{ dotMode() ? '' : text() }}`,
  host: {
    '[class.dot-mode]': 'dotMode()',
    '[class]': 'additionalClasses',
    '[class.status-primary]': 'status() === "primary"',
    '[class.status-success]': 'status() === "success"',
    '[class.status-info]': 'status() === "info"',
    '[class.status-warning]': 'status() === "warning"',
    '[class.status-danger]': 'status() === "danger"',
    '[class.status-basic]': 'status() === "basic"',
    '[class.status-control]': 'status() === "control"',
    '[class.position-top]': 'position().includes("top")',
    '[class.position-right]': 'position().includes("right")',
    '[class.position-bottom]': 'position().includes("bottom")',
    '[class.position-left]': 'position().includes("left")',
    '[class.position-start]': 'position().includes("start")',
    '[class.position-end]': 'position().includes("end")',
    '[class.position-center]': 'position().includes("center")',
  },
})
export class NbBadgeComponent {
  private statusService = inject(NbStatusService);

  /**
   * Text to display
   * @type string
   */
  public text = input('');

  /**
   * Badge position
   *
   * Can be set to any class or to one of predefined positions:
   * 'top left', 'top right', 'bottom left', 'bottom right',
   * 'top start', 'top end', 'bottom start', 'bottom end'
   * @type string
   */
  public position = input<NbBadgePosition>('top right');

  /**
   * Shows badge as a dot. No text is shown.
   * @type boolean
   */
  public dotMode = input(false, { transform: booleanAttribute });

  /**
   * Badge status (adds specific styles):
   * 'basic', 'primary', 'info', 'success', 'warning', 'danger', 'control'
   */
  public status = input<NbComponentOrCustomStatus>('basic');

  public get additionalClasses(): string[] {
    if (this.statusService.isCustomStatus(this.status())) {
      return [this.statusService.getStatusClass(this.status())];
    }
    return [];
  }
}
