import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { HomePage } from '../pages/home/home';
import { CategoriesPage } from '../pages/categories/categories';
import { LoginPage } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { AdminProductsPage } from '../pages/admin-products/admin-products';
import { AdminUserCoorPage } from '../pages/admin-user-coor/admin-user-coor';
import { AdminUsersPage } from '../pages/admin-users/admin-users';
import { BillsListPage } from '../pages/bills-list/bills-list';
import { AdminTiposCobroPage } from '../pages/admin-tipos-cobro/admin-tipos-cobro';
import Parse from 'parse'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{id:number, title: string, component: any, icon:string}>;

  constructor(public platform: Platform, 
              public statusBar: StatusBar, 
              public splashScreen: SplashScreen,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController) {
    this.initializeApp();
    
    Parse.initialize("poshn", "2018.T3cm0v@p.P0S");
    Parse.serverURL = 'http://poshn.herokuapp.com/parse';

    // used for an example of ngFor and navigation
    this.pages = [
      {id:1, title: 'Home', component: HomePage, icon:"md-home" },
      {id:2, title: 'Categorias', component: CategoriesPage, icon:"md-basket" },
      {id:3, title: 'Productos', component: AdminProductsPage, icon:"md-apps"},
      {id:7, title: 'Facturas', component: BillsListPage, icon:"md-calculator"},
      {id:4, title: 'Clientes Coorporativos', component: AdminUserCoorPage, icon:"md-list-box"},
      {id:5, title: 'Clientes', component: AdminUsersPage, icon:"md-people"},
      {id:8, title: 'Tipos de Cobro', component: AdminTiposCobroPage, icon:"card"},
      {id:6, title: 'Ajustes', component: SettingsPage, icon:"md-construct" }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(page.id != 2 && page.id != 1)
      this.nav.setRoot(page.component);
    else{
      this.nav.setRoot(page.component, {title:"Categorias", subcat:false});
    }
  }

  logout(){
    Parse.User.logOut().then((resp) => {
      this.nav.setRoot(LoginPage);
      this.toastMsj("Gracias por utilizar POSHN");
    }, err => {
      this.toastMsj("Error logout POSHN");
    })
  }

  showAlert(titulo, msj) {
    const alert = this.alertCtrl.create({
      title: titulo,
      subTitle: msj,
      buttons: ['Aceptar']
    });
    alert.present();
  }

  toastMsj(msj) {
    let toast = this.toastCtrl.create({
      message: msj,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      //console.log('Dismissed toast');
    });  
    toast.present();
  }
}
