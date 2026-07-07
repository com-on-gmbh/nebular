import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  NgZone,
  Renderer2,
  booleanAttribute,
  contentChildren,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

import { NbStatusService } from '../../services/status.service';
import { NbComponentShape } from '../component-shape';
import { NbComponentSize } from '../component-size';
import { NbComponentOrCustomStatus } from '../component-status';
import { NbIconComponent } from '../icon/icon.component';

export type NbButtonAppearance = 'filled' | 'outline' | 'ghost' | 'hero';

export interface NbButtonProperties {
  appearance?: NbButtonAppearance;
  size?: NbComponentSize;
  shape?: NbComponentShape;
  status?: NbComponentOrCustomStatus;
  disabled?: boolean;
}

@Directive({
  standalone: true,
  host: {
    '[class.appearance-filled]': 'appearance() === "filled"',
    '[class.appearance-outline]': 'appearance() === "outline"',
    '[class.appearance-ghost]': 'appearance() === "ghost"',
    '[class.full-width]': 'fullWidth()',
    '[attr.aria-disabled]': 'disabled()',
    '[class.btn-disabled]': 'disabled()',
    '[attr.tabindex]': 'tabbable',
    '[class.size-tiny]': 'size() === "tiny"',
    '[class.size-small]': 'size() === "small"',
    '[class.size-medium]': 'size() === "medium"',
    '[class.size-large]': 'size() === "large"',
    '[class.size-giant]': 'size() === "giant"',
    '[class.shape-rectangle]': 'shape() === "rectangle"',
    '[class.shape-round]': 'shape() === "round"',
    '[class.shape-semi-round]': 'shape() === "semi-round"',
    '[class.icon-start]': 'iconLeft',
    '[class.icon-end]': 'iconRight',
    '[class]': 'additionalClasses',
  },
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class NbButton implements AfterViewInit {
  // Internal input aliases — linked to writable signals so updateProperties() and subclass effects can overwrite them
  protected _sizeInput = input<NbComponentSize>('medium', { alias: 'size' });
  protected _statusInput = input<NbComponentOrCustomStatus>('basic', { alias: 'status' });
  protected _shapeInput = input<NbComponentShape>('rectangle', { alias: 'shape' });
  protected _appearanceInput = input<NbButtonAppearance>('filled', { alias: 'appearance' });
  protected _disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Button size, available sizes:
   * `tiny`, `small`, `medium`, `large`, `giant`
   */
  public size = linkedSignal<NbComponentSize>(() => this._sizeInput());

  /**
   * Button status (adds specific styles):
   * `primary`, `info`, `success`, `warning`, `danger`
   */
  public status = linkedSignal<NbComponentOrCustomStatus>(() => this._statusInput());

  /**
   * Button shapes: `rectangle`, `round`, `semi-round`
   */
  public shape = linkedSignal<NbComponentShape>(() => this._shapeInput());

  /**
   * Button appearance: `filled`, `outline`, `ghost`, `hero`
   */
  public appearance = linkedSignal<NbButtonAppearance>(() => this._appearanceInput());

  /**
   * Sets `filled` appearance
   */
  public filled = input(false, { transform: booleanAttribute });

  /**
   * Sets `outline` appearance
   */
  public outline = input(false, { transform: booleanAttribute });

  /**
   * Sets `ghost` appearance
   */
  public ghost = input(false, { transform: booleanAttribute });

  /**
   * If set element will fill its container
   */
  public fullWidth = input(false, { transform: booleanAttribute });

  /**
   * Disables the button
   */
  public disabled = linkedSignal<boolean>(() => this._disabledInput());

  /**
   * Tabindex of the button.
   */
  public tabIndex = input<number | undefined>(undefined);

  // issue #794
  public get tabbable(): string {
    if (this.disabled()) {
      return '-1';
    }

    if (this.tabIndex() == null) {
      return '0';
    }

    return this.tabIndex()!.toString();
  }

  public iconLeft = false;
  public iconRight = false;

  public get additionalClasses(): string[] {
    if (this.statusService.isCustomStatus(this.status())) {
      return [this.statusService.getStatusClass(this.status())];
    }
    return [];
  }

  public icons = contentChildren(NbIconComponent, { read: ElementRef });

  protected renderer = inject(Renderer2);
  protected hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  protected cd = inject(ChangeDetectorRef);
  protected zone = inject(NgZone);
  protected statusService = inject(NbStatusService);

  protected constructor() {
    effect(() => {
      if (this.filled()) {
        this.appearance.set('filled');
      }
    });
    effect(() => {
      if (this.outline()) {
        this.appearance.set('outline');
      }
    });
    effect(() => {
      if (this.ghost()) {
        this.appearance.set('ghost');
      }
    });
    effect(() => {
      this.renderer.setProperty(this.hostElement.nativeElement, 'disabled', this.disabled());
    });
    effect(() => {
      const icons = this.icons();
      const nodes = this.nodes;
      this.iconLeft = nodes.length > 0 ? this.isIconExist(nodes[0]) : false;
      this.iconRight = nodes.length > 0 ? this.isIconExist(nodes[nodes.length - 1]) : false;
    });
  }

  public ngAfterViewInit(): void {
    // TODO: #2254
    this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.renderer.addClass(this.hostElement.nativeElement, 'nb-transition');
      }),
    );
  }

  /**
   * @docs-private
   **/
  public updateProperties(config: Partial<NbButtonProperties>): void {
    if (config.appearance !== undefined) {
      this.appearance.set(config.appearance);
    }
    if (config.size !== undefined) {
      this.size.set(config.size);
    }
    if (config.shape !== undefined) {
      this.shape.set(config.shape);
    }
    if (config.status !== undefined) {
      this.status.set(config.status);
    }
    if (config.disabled !== undefined) {
      this.disabled.set(config.disabled);
    }
  }

  public get iconElement(): Element | null {
    const el = this.hostElement.nativeElement;
    return el.querySelector('nb-icon');
  }

  protected get nodes(): Node[] {
    return (this.cd as EmbeddedViewRef<any>).rootNodes.filter((child: Node) => child.nodeType !== Node.COMMENT_NODE);
  }

  protected isIconExist(node: Node): boolean {
    return this.icons().some((item: ElementRef) => item.nativeElement === node);
  }
}
