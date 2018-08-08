import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreBillsListPage } from './pre-bills-list';

@NgModule({
  declarations: [
    PreBillsListPage,
  ],
  imports: [
    IonicPageModule.forChild(PreBillsListPage),
  ],
})
export class PreBillsListPageModule {}
