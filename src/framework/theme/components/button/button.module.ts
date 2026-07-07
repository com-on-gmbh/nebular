/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';

import { NbButtonComponent } from './button.component';

const NB_BUTTON_COMPONENTS = [NbButtonComponent];

@NgModule({
  imports: [...NB_BUTTON_COMPONENTS],
  exports: [...NB_BUTTON_COMPONENTS],
})
export class NbButtonModule {}
