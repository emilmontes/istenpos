import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreBillDetailsPage } from './pre-bill-details';

@NgModule({
  declarations: [
    PreBillDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(PreBillDetailsPage),
  ],
})
export class PreBillDetailsPageModule {}
