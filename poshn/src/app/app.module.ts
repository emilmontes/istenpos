import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { BillDetailsPage } from '../pages/bill-details/bill-details';
import { BillsListPage } from '../pages/bills-list/bills-list';
import { CategoriesPage } from '../pages/categories/categories';
import { CreateCategoryPage } from '../pages/create-category/create-category'
import { LoginPage } from '../pages/login/login';
import { PreBillDetailsPage } from '../pages/pre-bill-details/pre-bill-details';
import { PreBillsListPage } from '../pages/pre-bills-list/pre-bills-list';
import { SignupPage } from '../pages/signup/signup';
import { SettingsPage } from '../pages/settings/settings';
import { AdminProductsPage } from '../pages/admin-products/admin-products';
import { AdminUserCoorPage } from '../pages/admin-user-coor/admin-user-coor';
import { AdminUsersPage } from '../pages/admin-users/admin-users';
import { AdminTiposCobroPage } from '../pages/admin-tipos-cobro/admin-tipos-cobro';
import { AddCobroPage } from '../pages/add-cobro/add-cobro';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    BillDetailsPage,
    BillsListPage,
    CategoriesPage,
    CreateCategoryPage,
    LoginPage,
    PreBillDetailsPage,
    PreBillsListPage,
    SignupPage,
    SettingsPage,
    AdminProductsPage,
    AdminUserCoorPage,
    AdminUsersPage,
    AdminTiposCobroPage,
    AddCobroPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    BillDetailsPage,
    BillsListPage,
    CategoriesPage,
    CreateCategoryPage,
    LoginPage,
    PreBillDetailsPage,
    PreBillsListPage,
    SignupPage,
    SettingsPage,
    AdminProductsPage,
    AdminUserCoorPage,
    AdminUsersPage,
    AdminTiposCobroPage,
    AddCobroPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
