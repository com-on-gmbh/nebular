/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { NbStatusService } from '../../services/status.service';
import { NbComponentOrCustomStatus } from '../component-status';
import { NbIconLibraries } from './icon-libraries';

export interface NbIconConfig {
  icon: string;
  pack?: string;
  status?: NbComponentOrCustomStatus;
  options?: { [name: string]: any };
}

/**
 * Icon component. Allows to render both `svg` and `font` icons.
 * Starting from Nebular 4.0 uses [Eva Icons](https://akveo.github.io/eva-icons/) pack by default.
 *
 * Basic icon example:
 * @stacked-example(Showcase, icon/icon-showcase.component)
 *
 * Icon configuration:
 *
 * ```html
 * <nb-icon icon="star"></nb-icon>
 * ```
 * ### Installation
 *
 * By default Nebular comes without any pre-installed icon pack.
 * Starting with Nebular 4.0.0 we ship separate package called `@nebular/eva-icons`
 * which integrates SVG [Eva Icons](https://akveo.github.io/eva-icons/) pack to Nebular. To add it to your
 * project run:
 * ```sh
 * npm i eva-icons @nebular/eva-icons
 * ```
 * This command will install Eva Icons pack. Then register `NbEvaIconsModule` into your app module:
 * ```ts
 * import { NbEvaIconsModule } from '@nebular/eva-icons';
 *
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbEvaIconsModule,
 *   ],
 * })
 * export class AppModule { }
 * ```
 * Last thing, import `NbIconModule` to your feature module where you need to show an icon:
 * ```ts
 * import { NbIconModule } from '@nebular/theme';
 *
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbIconModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Icon can be colored using `status` input:
 * ```html
 * <nb-icon icon="star" status="warning"></nb-icon>
 * ```
 *
 * Colored icons:
 * @stacked-example(Colored Icons, icon/icon-colors.component)
 *
 * In case you need to specify an icon from a specific icon pack, this could be done using `pack` input property:
 * ```html
 * <nb-icon icon="star" pack="font-awesome"></nb-icon>
 * ```
 * Additional icon settings (if available by the icon pack) could be passed using `options` input:
 *
 * ```html
 * <nb-icon icon="star" [options]="{ animation: { type: 'zoom' } }"></nb-icon>
 * ```
 *
 * @styles
 *
 * icon-font-size:
 * icon-line-height:
 * icon-width:
 * icon-height:
 * icon-svg-vertical-align:
 * icon-basic-color:
 * icon-primary-color:
 * icon-info-color:
 * icon-success-color:
 * icon-warning-color:
 * icon-danger-color:
 * icon-control-color:
 */
@Component({
  selector: 'nb-icon',
  styleUrls: [`./icon.component.scss`],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  host: {
    '[innerHtml]': 'html',
    '[class.status-primary]': 'effectiveStatus() === "primary"',
    '[class.status-info]': 'effectiveStatus() === "info"',
    '[class.status-success]': 'effectiveStatus() === "success"',
    '[class.status-warning]': 'effectiveStatus() === "warning"',
    '[class.status-danger]': 'effectiveStatus() === "danger"',
    '[class.status-basic]': 'effectiveStatus() === "basic"',
    '[class.status-control]': 'effectiveStatus() === "control"',
    '[class]': 'additionalClasses',
  },
})
export class NbIconComponent {
  private sanitizer = inject(DomSanitizer);
  private iconLibrary = inject(NbIconLibraries);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private statusService = inject(NbStatusService);

  protected prevClasses: string[] = [];

  public html: SafeHtml = '';

  /**
   * Icon name
   */
  public icon = input<string>();

  /**
   * Icon pack name
   */
  public pack = input<string>();

  /**
   * Additional icon settings
   * @param {[name: string]: any}
   */
  public options = input<{ [name: string]: any }>();

  /**
   * Icon status (adds specific styles):
   * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
   */
  public status = input<NbComponentOrCustomStatus>();

  /**
   * Sets all icon configurable properties via config object.
   * If passed value is a string set icon name.
   * @docs-private
   */
  public config = input<string | NbIconConfig>();

  /** Effective status, merging `config` over the `status` input. Referenced in host metadata. */
  public effectiveStatus = computed<NbComponentOrCustomStatus | undefined>(() => {
    const cfg = this.config();
    if (cfg && typeof cfg !== 'string') {
      return cfg.status;
    }
    return this.status();
  });

  public get additionalClasses(): string[] {
    if (this.statusService.isCustomStatus(this.effectiveStatus())) {
      return [this.statusService.getStatusClass(this.effectiveStatus())];
    }
    return [];
  }

  private effectiveIcon = computed<string | undefined>(() => {
    const cfg = this.config();
    if (!cfg) {
      return this.icon();
    }
    return typeof cfg === 'string' ? cfg : cfg.icon;
  });

  private effectivePack = computed<string | undefined>(() => {
    const cfg = this.config();
    if (!cfg || typeof cfg === 'string') {
      return this.pack();
    }
    return cfg.pack;
  });

  private effectiveOptions = computed<{ [name: string]: any } | undefined>(() => {
    const cfg = this.config();
    if (!cfg || typeof cfg === 'string') {
      return this.options();
    }
    return cfg.options;
  });

  constructor() {
    effect(() => {
      const icon = this.effectiveIcon();
      const pack = this.effectivePack();
      const options = this.effectiveOptions();
      if (icon) {
        const iconDef = this.iconLibrary.getIcon(icon, pack);
        if (iconDef) {
          this.renderIcon(icon, pack, options);
        } else {
          this.clearIcon();
        }
      }
    });
  }

  public renderIcon(name: string, pack?: string, options?: { [name: string]: any }) {
    const iconDefinition = this.iconLibrary.getIcon(name, pack);

    if (!iconDefinition) {
      return undefined;
    }

    const content = iconDefinition.icon.getContent(options);
    if (content) {
      this.html = this.sanitizer.bypassSecurityTrustHtml(content);
    }

    this.assignClasses(iconDefinition.icon.getClasses(options));
    return iconDefinition;
  }

  protected clearIcon(): void {
    this.html = '';
    this.assignClasses([]);
  }

  protected assignClasses(classes: string[]): void {
    this.prevClasses.forEach((className: string) => {
      this.renderer.removeClass(this.el.nativeElement, className);
    });

    classes.forEach((className: string) => {
      this.renderer.addClass(this.el.nativeElement, className);
    });

    this.prevClasses = classes;
  }
}
