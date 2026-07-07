import {
  CdkTable,
  CdkTableModule,
} from '@angular/cdk/table';
import { Component, NgModule } from '@angular/core';

import { NbBidiModule } from '../bidi/bidi.module';
import {
  NbCellDefDirective,
  NbCellDirective,
  NbColumnDefDirective,
  NbFooterCellDefDirective,
  NbFooterCellDirective,
  NbHeaderCellDefDirective,
  NbHeaderCellDirective,
} from './cell';
import {
  NbCellOutletDirective,
  NbDataRowOutletDirective,
  NbFooterRowComponent,
  NbFooterRowDefDirective,
  NbFooterRowOutletDirective,
  NbHeaderRowComponent,
  NbHeaderRowDefDirective,
  NbHeaderRowOutletDirective,
  NbNoDataRowOutletDirective,
  NbRowComponent,
  NbRowDefDirective,
} from './row';

export const NB_TABLE_TEMPLATE = `
  <ng-container nbHeaderRowOutlet></ng-container>
  <ng-container nbRowOutlet></ng-container>
  <ng-container nbNoDataRowOutlet></ng-container>
  <ng-container nbFooterRowOutlet></ng-container>
`;

@Component({
  selector: 'nb-table-not-implemented',
  template: ``,
  standalone: false,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class NbTable<T> extends CdkTable<T> {
}

const COMPONENTS = [
  NbTable,

  // Template defs
  NbHeaderCellDefDirective,
  NbHeaderRowDefDirective,
  NbColumnDefDirective,
  NbCellDefDirective,
  NbRowDefDirective,
  NbFooterCellDefDirective,
  NbFooterRowDefDirective,

  // Outlets
  NbDataRowOutletDirective,
  NbHeaderRowOutletDirective,
  NbFooterRowOutletDirective,
  NbNoDataRowOutletDirective,
  NbCellOutletDirective,

  // Cell directives
  NbHeaderCellDirective,
  NbCellDirective,
  NbFooterCellDirective,

  // Row directives
  NbHeaderRowComponent,
  NbRowComponent,
  NbFooterRowComponent,
];

@NgModule({
  imports: [NbBidiModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class NbTableModule extends CdkTableModule { }
