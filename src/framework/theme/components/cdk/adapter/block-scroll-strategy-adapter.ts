import { Inject, Injectable, NgZone, Injector } from '@angular/core';
import { BlockScrollStrategy, ScrollDispatcher, ScrollStrategyOptions } from '@angular/cdk/overlay';

import { NbLayoutScrollService } from '../../../services/scroll.service';
import { NB_DOCUMENT } from '../../../theme.options';
import { NbViewportRulerAdapter } from './viewport-ruler-adapter';


/**
 * Overrides default block scroll strategy because default strategy blocks scrolling on the body only.
 * But Nebular has its own scrollable container - nb-layout. So, we need to block scrolling in it to.
 * */
@Injectable()
export class NbBlockScrollStrategyAdapter extends BlockScrollStrategy {
  constructor(@Inject(NB_DOCUMENT) document: any,
              viewportRuler: NbViewportRulerAdapter,
              protected scrollService: NbLayoutScrollService,
              injector: Injector) {
    super(injector);
  }

  enable() {
    super.enable();
    this.scrollService.scrollable(false);
  }

  disable() {
    super.disable();
    this.scrollService.scrollable(true);
  }
}

@Injectable()
export class NbScrollStrategyOptions extends ScrollStrategyOptions {
  constructor(protected scrollService: NbLayoutScrollService,
              protected scrollDispatcher: ScrollDispatcher,
              protected viewportRuler: NbViewportRulerAdapter,
              protected ngZone: NgZone,
              @Inject(NB_DOCUMENT) protected document,
              injector: Injector) {
    super(injector);
  }

  block = () => new NbBlockScrollStrategyAdapter(this.document, this.viewportRuler, this.scrollService, null as any);
}

export type NbScrollStrategies = keyof Pick<NbScrollStrategyOptions, 'noop' | 'close' | 'block' | 'reposition'>;
