/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { filter, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  NbActiveDescendantKeyManager,
  NbActiveDescendantKeyManagerFactoryService,
  NbKeyManagerActiveItemMode,
} from '../cdk/a11y/descendant-key-manager';
import { NbScrollStrategies } from '../cdk/adapter/block-scroll-strategy-adapter';
import { ENTER, ESCAPE } from '../cdk/keycodes/keycodes';
import { NbOverlayRef, NbScrollStrategy } from '../cdk/overlay/mapping';
import {
  NbAdjustableConnectedPositionStrategy,
  NbAdjustment,
  NbPosition,
  NbPositionBuilderService,
} from '../cdk/overlay/overlay-position';
import { NbOverlayService } from '../cdk/overlay/overlay-service';
import { NbTrigger, NbTriggerStrategy, NbTriggerStrategyBuilderService } from '../cdk/overlay/overlay-trigger';
import { NbOptionComponent } from '../option/option.component';
import { NbAutocompleteComponent } from './autocomplete.component';

/**
 * The `NbAutocompleteDirective` provides a capability to expand input with
 * `NbAutocompleteComponent` overlay containing options to select and fill input with.
 *
 * @stacked-example(Showcase, autocomplete/autocomplete-showcase.component)
 *
 * ### Installation
 *
 * Standalone (recommended):
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [
 *     // ...
 *     NbAutocompleteDirective,
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
 *     NbAutocompleteModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * You can bind control with form controls or ngModel.
 *
 * @stacked-example(Autocomplete form binding, autocomplete/autocomplete-form.component)
 *
 * Options in the autocomplete may be grouped using `nb-option-group` component.
 *
 * @stacked-example(Grouping, autocomplete/autocomplete-group.component)
 *
 * Autocomplete may change selected option value via provided function.
 *
 * @stacked-example(Custom display, autocomplete/autocomplete-custom-display.component)
 *
 * Also, autocomplete may make first option in option list active automatically.
 *
 * @stacked-example(Active first, autocomplete/autocomplete-active-first.component)
 *
 * */
@Directive({
  selector: 'input[nbAutocomplete]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NbAutocompleteDirective),
      multi: true,
    },
  ],
  standalone: true,
  host: {
    '[class.nb-autocomplete-position-top]': 'top',
    '[class.nb-autocomplete-position-bottom]': 'bottom',
    role: 'combobox',
    'aria-autocomplete': 'list',
    haspopup: 'true',
    '[attr.aria-expanded]': 'ariaExpanded',
    '[attr.aria-owns]': 'ariaOwns',
    '[attr.aria-activedescendant]': 'ariaActiveDescendant',
    '(input)': 'handleInput()',
    '(keydown.arrowDown)': 'handleKeydown()',
    '(keydown.arrowUp)': 'handleKeydown()',
    '(blur)': 'handleBlur()',
  },
})
export class NbAutocompleteDirective<T> implements OnDestroy, AfterViewInit, ControlValueAccessor {
  /**
   * Trigger strategy used by overlay.
   * @docs-private
   * */
  protected triggerStrategy: NbTriggerStrategy;

  protected positionStrategy: NbAdjustableConnectedPositionStrategy;

  protected overlayRef: NbOverlayRef;

  protected keyManager: NbActiveDescendantKeyManager<NbOptionComponent<T>>;

  protected destroy$: Subject<void> = new Subject<void>();

  protected _onChange: (value: T) => void = () => {};

  protected _onTouched = () => {};

  /**
   * Determines is autocomplete overlay opened.
   * */
  public get isOpen(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }

  /**
   * Determines is autocomplete overlay closed.
   * */
  protected get isClosed(): boolean {
    return !this.isOpen;
  }

  /**
   * Provides autocomplete component.
   * */
  public autocomplete = input.required<NbAutocompleteComponent<T>>({ alias: 'nbAutocomplete' });

  /**
   * Determines options overlay offset (in pixels).
   **/
  public overlayOffset = input(8);

  /**
   * Determines options overlay scroll strategy.
   **/
  public scrollStrategy = input<NbScrollStrategies>('block');

  public customOverlayHost = input<ElementRef>();

  public get top(): boolean {
    return (
      this.isOpen && !!this.autocomplete().options.length && this.autocomplete().overlayPosition === NbPosition.TOP
    );
  }

  public get bottom(): boolean {
    return (
      this.isOpen && !!this.autocomplete().options.length && this.autocomplete().overlayPosition === NbPosition.BOTTOM
    );
  }

  public get ariaExpanded(): string | false {
    return this.isOpen && this.isOpen.toString();
  }

  public get ariaOwns(): string | null {
    return this.isOpen ? this.autocomplete().id : null;
  }

  public get ariaActiveDescendant(): string | null {
    return this.isOpen && this.keyManager.activeItem ? this.keyManager.activeItem.id : null;
  }

  protected hostRef = inject(ElementRef);
  protected overlay = inject(NbOverlayService);
  protected cd = inject(ChangeDetectorRef);
  protected triggerStrategyBuilder = inject(NbTriggerStrategyBuilderService);
  protected positionBuilder = inject(NbPositionBuilderService);
  protected activeDescendantKeyManagerFactory = inject<
    NbActiveDescendantKeyManagerFactoryService<NbOptionComponent<T>>
  >(NbActiveDescendantKeyManagerFactoryService);
  protected renderer = inject(Renderer2);

  public ngAfterViewInit(): void {
    this.triggerStrategy = this.createTriggerStrategy();
    this.subscribeOnTriggers();
  }

  public ngOnDestroy(): void {
    if (this.triggerStrategy) {
      this.triggerStrategy.destroy();
    }

    if (this.positionStrategy) {
      this.positionStrategy.dispose();
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  public handleInput(): void {
    const currentValue = this.hostRef.nativeElement.value;
    this._onChange(currentValue);
    this.setHostInputValue(this.getDisplayValue(currentValue));
    this.show();
  }

  public handleKeydown(): void {
    this.show();
  }

  public handleBlur(): void {
    this._onTouched();
  }

  public show(): void {
    if (this.shouldShow()) {
      this.attachToOverlay();
      this.setActiveItem();
    }
  }

  public hide(): void {
    if (this.isOpen) {
      this.overlayRef.detach();
      // Need to update host bindings — overlay state is non-signal
      this.cd.markForCheck();
    }
  }

  public writeValue(value: T): void {
    this.handleInputValueUpdate(value);
  }

  public registerOnChange(fn: (value: any) => {}): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public setDisabledState(disabled: boolean): void {
    this.renderer.setProperty(this.hostRef.nativeElement, 'disabled', disabled);
  }

  protected subscribeOnOptionClick(): void {
    /**
     * If the user changes provided options list in the runtime we have to handle this
     * and resubscribe on options selection changes event.
     * Otherwise, the user will not be able to select new options.
     * */
    this.autocomplete()
      .options.changes.pipe(
        tap(() => this.setActiveItem()),
        startWith(this.autocomplete().options),
        switchMap((options: QueryList<NbOptionComponent<T>>) => {
          return merge(...options.map((option) => option.click));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((clickedOption: NbOptionComponent<T>) => this.handleInputValueUpdate(clickedOption.value, true));
  }

  protected subscribeOnPositionChange(): void {
    this.positionStrategy.positionChange.pipe(takeUntil(this.destroy$)).subscribe((position: NbPosition) => {
      this.autocomplete().overlayPosition = position;
      this.cd.detectChanges();
    });
  }

  protected getActiveItem(): NbOptionComponent<T> {
    return this.keyManager.activeItem;
  }

  protected setupAutocomplete(): void {
    this.autocomplete().setHost(this.customOverlayHost() || this.hostRef);
  }

  protected getDisplayValue(value: string): string {
    const displayFn = this.autocomplete().handleDisplayFn();
    return displayFn ? displayFn(value) : value;
  }

  protected getContainer(): ComponentRef<any> | null {
    if (!this.overlayRef || !this.isOpen) {
      return null;
    }
    return <ComponentRef<any>>{
      location: {
        nativeElement: this.overlayRef.overlayElement,
      },
    };
  }

  protected handleInputValueUpdate(value: T, focusInput: boolean = false): void {
    this.setHostInputValue(value ?? '');
    this._onChange(value);
    if (focusInput) {
      this.hostRef.nativeElement.focus();
    }
    this.autocomplete().emitSelected(value);
    this.hide();
  }

  protected subscribeOnTriggers(): void {
    this.triggerStrategy.show$.pipe(filter(() => this.isClosed)).subscribe(() => this.show());

    this.triggerStrategy.hide$.pipe(filter(() => this.isOpen)).subscribe(() => this.hide());
  }

  protected createTriggerStrategy(): NbTriggerStrategy {
    return this.triggerStrategyBuilder
      .trigger(NbTrigger.FOCUS)
      .host(this.hostRef.nativeElement)
      .container(() => this.getContainer())
      .build();
  }

  protected createKeyManager(): void {
    this.keyManager = this.activeDescendantKeyManagerFactory.create(this.autocomplete().options);
  }

  protected setHostInputValue(value: any): void {
    this.hostRef.nativeElement.value = this.getDisplayValue(value);
  }

  protected createPositionStrategy(): NbAdjustableConnectedPositionStrategy {
    return this.positionBuilder
      .connectedTo(this.customOverlayHost() || this.hostRef)
      .position(NbPosition.BOTTOM)
      .offset(this.overlayOffset())
      .adjustment(NbAdjustment.VERTICAL);
  }

  protected subscribeOnOverlayKeys(): void {
    this.overlayRef
      .keydownEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: KeyboardEvent) => {
        if (event.keyCode === ESCAPE && this.isOpen) {
          event.preventDefault();
          this.hostRef.nativeElement.focus();
          this.hide();
        } else if (event.keyCode === ENTER) {
          event.preventDefault();
          const activeItem = this.getActiveItem();
          if (!activeItem) {
            return;
          }
          this.handleInputValueUpdate(activeItem.value, true);
        } else {
          this.keyManager.onKeydown(event);
        }
      });
  }

  protected setActiveItem(): void {
    // If autocomplete has activeFirst input set to true,
    // keyManager set first option active, otherwise - reset active option.
    const mode = this.autocomplete().activeFirst()
      ? NbKeyManagerActiveItemMode.FIRST_ACTIVE
      : NbKeyManagerActiveItemMode.RESET_ACTIVE;
    this.keyManager.setActiveItem(mode);
    this.cd.detectChanges();
  }

  protected attachToOverlay(): void {
    if (!this.overlayRef) {
      this.setupAutocomplete();
      this.initOverlay();
    }
    this.overlayRef.attach(this.autocomplete().portal());
  }

  protected createOverlay(): void {
    const scrollStrategy = this.createScrollStrategy();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy,
      scrollStrategy,
      panelClass: this.autocomplete().optionsPanelClass(),
    });
  }

  protected initOverlay(): void {
    this.positionStrategy = this.createPositionStrategy();

    this.createKeyManager();
    this.subscribeOnPositionChange();
    this.subscribeOnOptionClick();
    this.checkOverlayVisibility();
    this.createOverlay();
    this.subscribeOnOverlayKeys();
  }

  protected checkOverlayVisibility(): void {
    this.autocomplete()
      .options.changes.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.autocomplete().options.length) {
          this.hide();
        }
      });
  }

  protected createScrollStrategy(): NbScrollStrategy {
    return this.overlay.scrollStrategies[this.scrollStrategy()]();
  }

  protected shouldShow(): boolean {
    return this.isClosed;
  }
}
