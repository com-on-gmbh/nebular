/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  QueryList,
  viewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NbPortalDirective } from '../cdk/overlay/mapping';
import { NbPosition } from '../cdk/overlay/overlay-position';
import { NbOverlayModule } from '../cdk/overlay/overlay.module';
import { NbComponentSize } from '../component-size';
import { NbOptionModule } from '../option/option-list.module';
import { NbOptionComponent } from '../option/option.component';

// Component class scoped counter for aria attributes.
let lastAutocompleteId: number = 0;

/**
 * The `NbAutocompleteComponent` overlay component.
 * Provides an `NbOptionList` overlay component.
 * */
@Component({
  selector: 'nb-autocomplete',
  standalone: true,
  imports: [NgClass, NbOverlayModule, NbOptionModule],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.size-tiny]': 'size() === "tiny"',
    '[class.size-small]': 'size() === "small"',
    '[class.size-medium]': 'size() === "medium"',
    '[class.size-large]': 'size() === "large"',
    '[class.size-giant]': 'size() === "giant"',
  },
})
export class NbAutocompleteComponent<T> implements AfterContentInit, OnDestroy {
  protected destroy$: Subject<void> = new Subject<void>();

  /**
   * HTML input reference to which autocomplete connected.
   * */
  public hostRef: ElementRef;

  /**
   * Component scoped id for aria attributes.
   * */
  public id: string = `nb-autocomplete-${lastAutocompleteId++}`;

  /**
   * @docs-private
   * Current overlay position because of we have to toggle overlayPosition
   * in [ngClass] direction.
   */
  protected _overlayPosition: NbPosition = '' as NbPosition;

  public get overlayPosition(): NbPosition {
    return this._overlayPosition;
  }

  public set overlayPosition(value: NbPosition) {
    this._overlayPosition = value;
    // Need run change detection after first set from NbAutocompleteDirective
    this.cd.detectChanges();
  }

  /**
   * Returns width of the input.
   * */
  public get hostWidth(): number {
    return this.hostRef.nativeElement.getBoundingClientRect().width;
  }

  /**
   * Function passed as input to process each string option value before render.
   * */
  public handleDisplayFn = input<(value: any) => string>();

  /**
   * Autocomplete size, available sizes:
   * `tiny`, `small`, `medium` (default), `large`, `giant`
   */
  public size = input<NbComponentSize>('medium');

  /**
   * Flag passed as input to always make first option active.
   * */
  public activeFirst = input(false);

  /**
   * Specifies class to be set on `nb-option`s container (`nb-option-list`)
   * */
  public optionsListClass = input<NgClass['ngClass']>();

  /**
   * Specifies class for the overlay panel with options
   * */
  public optionsPanelClass = input<string | string[]>();

  /**
   * Specifies width (in pixels) to be set on `nb-option`s container (`nb-option-list`).
   * Falls back to the host input's width when not set.
   * */
  protected _optionsWidthInput = input<number | undefined>(undefined, { alias: 'optionsWidth' });

  public get optionsWidth(): number {
    return this._optionsWidthInput() ?? this.hostWidth;
  }

  /**
   * Will be emitted when selected value changes.
   * */
  public selectedChange = output<T>();

  /**
   * List of `NbOptionComponent`'s components passed as content.
   * */
  @ContentChildren(NbOptionComponent, { descendants: true }) public options: QueryList<NbOptionComponent<T>>;

  /**
   * NbOptionList with options content.
   * */
  public portal = viewChild.required(NbPortalDirective);

  protected cd = inject(ChangeDetectorRef);

  public ngAfterContentInit(): void {
    this.options.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.cd.detectChanges());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Autocomplete knows nothing about host html input element.
   * So, attach method set input hostRef for styling.
   * */
  public setHost(hostRef: ElementRef): void {
    this.hostRef = hostRef;
  }

  /**
   * Propagate selected value.
   * */
  public emitSelected(selected: T): void {
    this.selectedChange.emit(selected);
  }
}
