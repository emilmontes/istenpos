import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/**
 * Generated class for the AdminUsersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import Parse from 'parse';
import{ SignupPage } from '../signup/signup'

@IonicPage()
@Component({
  selector: 'page-admin-users',
  templateUrl: 'admin-users.html',
})
export class AdminUsersPage {

  popLoading:any;
  customers:Array<{id:any, name:string, lastName:string, email:string, code:string, coorpId:any}>;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminUsersPage');
    this.getCustomers();
  }

  getCustomers(){
    this.presentLoading("Obteniendo datos");
    this.customers = Array<{id:any, name:string, lastName:string, email:string, code:string, coorpId:any}>();

    let Customer = Parse.Object.extend("Customers");
    let qFind = new Parse.Query(Customer);
    qFind.equalTo("deleted", false);
    qFind.ascending("name");

    qFind.find()
    .then(results=>{
      results.forEach(element => {
        this.customers.push({id:element.id, 
                            name:element.get("name"), 
                            lastName:element.get("lastName"), 
                            email:element.get("email"), 
                            code:element.get("code"),
                            coorpId:element.get("coorpId")});
      });
      this.popLoading.dismiss();
    })
    .catch(error=>{
      this.toastMsj("Error obteniendo datos");
      this.popLoading.dismiss();
    });

  }

  addCustomer() {
    const modal = this.modalCtrl.create(SignupPage);
    modal.onDidDismiss(data => {
      this.getCustomers();
    });
    modal.present();
  }

  confirmDeleteCustomer(item){
    const prompt = this.alertCtrl.create({
      title: '<b>Confirme eliminación</b>',
      message: "¿Desea eliminar el cliente <b>"+ item.name + " " + item.lastName +"</b> de manera permanente?",
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Eliminar',
          handler: data => {
            this.presentLoading("Eliminando");
            let Customer = Parse.Object.extend("Customers");
            let query = new Parse.Query(Customer);
            query.equalTo("objectId", item.id);

            query.find()
            .then(results =>{ 
              if(results.length > 0){
                results[0].set("deleted", true);

                results[0].save()
                .then(result=>{
                  this.popLoading.dismiss();
                  this.toastMsj("Cliente eliminado correctamente");
                  this.getCustomers();
                })
                .catch(error=>{       
                  this.popLoading.dismiss();             
                  this.toastMsj("Error eliminando cliente: 1003");
                  return false;
                });
              }
              else{
                this.popLoading.dismiss();
                this.toastMsj("Error eliminando categoria: 1002");
                return false;
              }
            }).catch(error => {
              this.toastMsj("Error eliminando categoria: 1001");
              this.popLoading.dismiss();
              return false;
            });
          }
        }
      ]
    });
    prompt.present();
  }

  editName(item){
    console.log("Id enviado: " + item.id);
    const modal = this.modalCtrl.create(SignupPage, {"userId":item.id, "coorpId":item.coorpId});
    modal.onDidDismiss(data => {
      this.getCustomers();
      console.log("Id recibido: " + data);
    });
    modal.present();
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

  presentLoading(msj) {
    const loader = this.loadingCtrl.create({
      content: msj
    });
    this.popLoading = loader;
    loader.present();
  }

}
