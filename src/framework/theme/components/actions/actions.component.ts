/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NbBadgePosition } from '../badge/badge.component';
import { NbBadgeModule } from '../badge/badge.module';
import { NbComponentSize } from '../component-size';
import { NbComponentOrCustomStatus } from '../component-status';
import { NbIconComponent, NbIconConfig } from '../icon/icon.component';

/**
 * Action item, display a link with an icon, or any other content provided instead.
 */
@Component({
  selector: 'nb-action',
  styleUrls: ['./action.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, NbIconComponent, NbBadgeModule],
  host: {
    '[class.disabled]': 'disabled()',
  },
  template: `
    @if (icon()) { @if (link()) {
    <a class="icon-container" [routerLink]="link()" [title]="title()">
      <nb-icon [config]="icon()"></nb-icon>
      <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
    </a>
    } @if (href() && !link()) {
    <a class="icon-container" [href]="href()" [title]="title()">
      <nb-icon [config]="icon()"></nb-icon>
      <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
    </a>
    } @if (!href() && !link()) {
    <a class="icon-container" href="#" [title]="title()" (click)="$event.preventDefault()">
      <nb-icon [config]="icon()"></nb-icon>
      <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
    </a>
    } } @else {
    <ng-content></ng-content>
    <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
    }
    <ng-template #badgeTemplate>
      @if (badgeText() || badgeDot()) {
      <nb-badge [text]="badgeText()" [dotMode]="badgeDot()" [status]="badgeStatus()" [position]="badgePosition()">
      </nb-badge>
      }
    </ng-template>
  `,
})
export class NbActionComponent {
  /**
   * Router link to use
   * @type string
   */
  public link = input<string>();

  /**
   * Regular HREF link
   * @type: string
   */
  public href = input<string>();

  /**
   * Optional title for mouseover
   * @type string
   */
  public title = input('');

  /**
   * Icon name or config object
   * @type {string | NbIconConfig}
   */
  public icon = input<string | NbIconConfig>();

  /**
   * Visually disables the item
   * @type boolean
   */
  public disabled = input(false, { transform: booleanAttribute });

  /**
   * Use badge dot mode
   * @type boolean
   */
  public badgeDot = input(false, { transform: booleanAttribute });

  /**
   * Badge text to display
   * @type string
   */
  public badgeText = input<string>();

  /**
   * Badge status (adds specific styles):
   * 'basic', 'primary', 'info', 'success', 'warning', 'danger', 'control'
   * @param {string} val
   */
  public badgeStatus = input<NbComponentOrCustomStatus>('basic');

  /**
   * Badge position.
   * Can be set to any class or to one of predefined positions:
   * 'top left', 'top right', 'bottom left', 'bottom right',
   * 'top start', 'top end', 'bottom start', 'bottom end'
   * @type string
   */
  public badgePosition = input<NbBadgePosition>();
}

/**
 * Shows a horizontal list of actions, available in multiple sizes.
 * Aligns items vertically.
 *
 * @stacked-example(Showcase, action/action-showcase.component)
 *
 * Basic actions setup:
 * ```html
 * <nb-actions size="small">
 *   <nb-action icon="nb-search"></nb-action>
 *   <nb-action icon="nb-power-circled"></nb-action>
 *   <nb-action icon="nb-person"></nb-action>
 * </nb-actions>
 * ```
 * ### Installation
 *
 * Import `NbActionsModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbActionsModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Multiple sizes example:
 * @stacked-example(Multiple Sizes, action/action-sizes.component)
 *
 * It is also possible to specify a `badge` value:
 *
 * @stacked-example(Action Badge, action/action-badge.component)
 *
 * and we can set it to full a width of a parent component
 * @stacked-example(Full Width, action/action-width.component)
 *
 * Action dot mode
 * @stacked-example(Action badge in dot mode, action/action-dot-mode.component)
 *
 * @styles
 *
 * actions-background-color:
 * actions-divider-color:
 * actions-divider-style:
 * actions-divider-width:
 * actions-icon-color:
 * actions-text-color:
 * actions-text-font-family:
 * actions-text-font-weight:
 * actions-text-line-height:
 * actions-disabled-icon-color:
 * actions-disabled-text-color:
 * actions-tiny-height:
 * actions-tiny-icon-height:
 * actions-tiny-padding:
 * actions-tiny-text-font-size:
 * actions-small-height:
 * actions-small-icon-height:
 * actions-small-padding:
 * actions-small-text-font-size:
 * actions-medium-height:
 * actions-medium-icon-height:
 * actions-medium-padding:
 * actions-medium-text-font-size:
 * actions-large-height:
 * actions-large-icon-height:
 * actions-large-padding:
 * actions-large-text-font-size:
 * actions-giant-height:
 * actions-giant-icon-height:
 * actions-giant-padding:
 * actions-giant-text-font-size:
 */
@Component({
  selector: 'nb-actions',
  styleUrls: ['./actions.component.scss'],
  standalone: true,
  imports: [],
  host: {
    '[class.full-width]': 'fullWidth()',
    '[class.size-tiny]': 'size() === "tiny"',
    '[class.size-small]': 'size() === "small"',
    '[class.size-medium]': 'size() === "medium"',
    '[class.size-large]': 'size() === "large"',
    '[class.size-giant]': 'size() === "giant"',
  },
  template: ` <ng-content select="nb-action"></ng-content> `,
})
export class NbActionsComponent {
  /**
   * Size of the component: 'tiny', 'small' (default), 'medium', 'large', 'giant'
   */
  public size = input<NbComponentSize>('small');

  /**
   * Component will fill full width of the container
   */
  public fullWidth = input(false, { transform: booleanAttribute });
}
