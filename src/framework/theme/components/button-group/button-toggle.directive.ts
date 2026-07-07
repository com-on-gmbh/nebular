/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NbButton, NbButtonAppearance } from '../button/base-button';
import { NB_BUTTON_GROUP } from './button-group-injection-tokens';

export type NbButtonToggleAppearance = Exclude<NbButtonAppearance, 'hero'>;

export interface NbButtonToggleChange {
  source: NbButtonToggleDirective;
  pressed: boolean;
}

/**
 * `[nbButtonToggle]` is a directive to add a `pressed` state to a button.
 */
@Directive({
    selector: 'button[nbButtonToggle]',
    providers: [{ provide: NbButton, useExisting: NbButtonToggleDirective }],
    exportAs: 'nbButtonToggle',
    standalone: false
})
export class NbButtonToggleDirective extends NbButton {
  protected readonly _pressedChange$ = new Subject<NbButtonToggleChange>();
  protected buttonGroup = inject(NB_BUTTON_GROUP, { optional: true });

  get pressedChange$(): Observable<NbButtonToggleChange> {
    return this._pressedChange$.asObservable();
  }

  constructor() {
    super();
  }

  /**
   * A value associated with the button.
   */
  @Input() value: any;

  /**
   * Controls button pressed state
   **/
  @Input()
  @HostBinding('attr.aria-pressed')
  get pressed(): boolean {
    return this._pressed;
  }
  set pressed(value: boolean) {
    if (this.pressed !== convertToBoolProperty(value)) {
      this._pressed = !this.pressed;
      this.pressedChange.emit(this.pressed);
      this._pressedChange$.next({ source: this, pressed: this.pressed });
    }
  }
  protected _pressed: boolean = false;
  static ngAcceptInputType_pressed: NbBooleanInput;

  /**
   * Emits whenever button pressed state change
   **/
  @Output() readonly pressedChange = new EventEmitter<boolean>();

  @HostBinding('class.status-basic')
  get basic(): boolean {
    // By design, all toggle buttons should have a `basic` status when not pressed.
    return !this.pressed;
  }

  @HostBinding('class.status-primary')
  get primary(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && (statusValue === 'basic' || statusValue === 'primary');
  }

  @HostBinding('class.status-success')
  get success(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && statusValue === 'success';
  }

  @HostBinding('class.status-info')
  get info(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && statusValue === 'info';
  }

  @HostBinding('class.status-warning')
  get warning(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && statusValue === 'warning';
  }

  @HostBinding('class.status-danger')
  get danger(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && statusValue === 'danger';
  }

  @HostBinding('class.status-control')
  get control(): boolean {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    return this.pressed && statusValue === 'control';
  }

  @HostBinding('class')
  get additionalClasses(): string[] {
    const statusValue = typeof this.status === 'function' ? this.status() : this.status;
    if (this.statusService.isCustomStatus(statusValue)) {
      return [this.statusService.getStatusClass(statusValue)];
    }
    return [];
  }

  @HostListener('click')
  onClick(): void {
    // Don't remove the pressed state of the button in single-toggle button-groups
    if (this.buttonGroup?.multiple || !this.pressed) {
      this.pressed = !this.pressed;
    }
  }

  /**
   * @docs-private
   */
  _updatePressed(value: boolean) {
    this.pressed = value;
    this.cd.markForCheck();
  }
}
