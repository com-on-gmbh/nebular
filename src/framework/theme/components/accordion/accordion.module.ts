/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';

import { NbAccordionItemBodyComponent } from './accordion-item-body.component';
import { NbAccordionItemHeaderComponent } from './accordion-item-header.component';
import { NbAccordionItemComponent } from './accordion-item.component';
import { NbAccordionComponent } from './accordion.component';

const NB_ACCORDION_COMPONENTS = [
  NbAccordionComponent,
  NbAccordionItemComponent,
  NbAccordionItemHeaderComponent,
  NbAccordionItemBodyComponent,
];

@NgModule({
  imports: [...NB_ACCORDION_COMPONENTS],
  exports: [...NB_ACCORDION_COMPONENTS],
  providers: [],
})
export class NbAccordionModule {}
