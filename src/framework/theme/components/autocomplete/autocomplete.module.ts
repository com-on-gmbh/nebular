/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';

import { NbOptionModule } from '../option/option-list.module';
import { NbAutocompleteComponent } from './autocomplete.component';
import { NbAutocompleteDirective } from './autocomplete.directive';

@NgModule({
  imports: [NbOptionModule, NbAutocompleteComponent, NbAutocompleteDirective],
  exports: [NbAutocompleteComponent, NbAutocompleteDirective, NbOptionModule],
})
export class NbAutocompleteModule {}
