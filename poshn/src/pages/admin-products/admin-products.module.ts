import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminProductsPage } from './admin-products';

@NgModule({
  declarations: [
    AdminProductsPage,
  ],
  imports: [
    IonicPageModule.forChild(AdminProductsPage),
  ],
})
export class AdminProductsPageModule {}
