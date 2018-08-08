import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/**
 * Generated class for the AdminUserCoorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import Parse from 'parse';

@IonicPage()
@Component({
  selector: 'page-admin-user-coor',
  templateUrl: 'admin-user-coor.html',
})
export class AdminUserCoorPage {
  coorps:Array<{id:any, name:string, code:string}>;
  popLoading:any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminUserCoorPage');
    this.getCoorps();
  }

  getCoorps(){
    this.presentLoading("Cargando datos");
    this.coorps = Array<{id:any, name:string, code:string}>();

    let Coorps = Parse.Object.extend("CustomersCoorp");
    let queryFindCoorps = new Parse.Query(Coorps);
    queryFindCoorps.equalTo("deleted",  false);
    queryFindCoorps.ascending("name");

    queryFindCoorps.find()
    .then(results=>{
      results.forEach(element => {
        this.coorps.push({id:element.id, name:element.get("name"), code:element.get("code")});
      });
      this.popLoading.dismiss();
    })
    .catch(error=>{
      this.popLoading.dismiss();
      this.toastMsj("Error obteniendo coorporaciones");
    });
  }

  addCoorp(){
    const prompt = this.alertCtrl.create({
      title: 'Agregar Coorporación',
      message: "Ingrese los datos de la coorporación",
      inputs: [
        {
          name: 'name',
          placeholder: "Nombre"
        },
        {
          name: 'code',
          placeholder: "Código numerico",
          type:"number"
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Guardar',
          handler: data => {
            if(data.name.length > 0 && data.code.length > 0){
              let UserCoorpF = Parse.Object.extend("CustomersCoorp");
              let queryFindCoorpsCode = new Parse.Query(UserCoorpF);
              queryFindCoorpsCode.equalTo("code", data.code);
              queryFindCoorpsCode.equalTo("deleted", false);
              
              queryFindCoorpsCode.find()
              .then(resFind=>{
                if(resFind.length > 0){
                  this.popLoading.dismiss();
                  this.toastMsj("Ya existe una coorporación con el mismo código");
                  return false;
                }
                else{
                  this.presentLoading("Guardando");
                  let UsersCoorp = Parse.Object.extend("CustomersCoorp");
                  let usuario = new UsersCoorp();
                  usuario.set("name", data.name);
                  usuario.set("code", data.code);
                  usuario.set("deleted", false);
    
                  usuario.save()
                  .then(results =>{ 
                    this.popLoading.dismiss();
                    this.toastMsj("Datos guardados correctamente");
                    this.getCoorps();
                  }).catch(error => {
                    this.toastMsj("Error guardando datos: 1002");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
              }).catch(error=>{
                this.toastMsj("Error guardando datos: 1001");
                this.popLoading.dismiss();
                return false;
              });
            }
            else{
              this.toastMsj("Ingrese nombre y código");
              this.popLoading.dismiss();
              return false;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  confirmDelete(item){
    const prompt = this.alertCtrl.create({
      title: 'Confirme',
      message: "¿Desea eliminar <b>" + item.name + "</b> de manera permanente?",
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
            this.presentLoading("Guardando");
            let UserCoorpF = Parse.Object.extend("CustomersCoorp");
            let queryFindCoorps = new Parse.Query(UserCoorpF);
            queryFindCoorps.equalTo("objectId", item.id);
            
            queryFindCoorps.find().then(resFind=>{
              if(resFind.length > 0){
                resFind[0].set("deleted", true);

                resFind[0].save()
                .then(results =>{ 
                  this.popLoading.dismiss();
                  this.toastMsj("Coorporación eliminada correctamente");
                  this.getCoorps();
                }).catch(error => {
                  this.toastMsj("Error eliminando datos: 1002");
                  this.popLoading.dismiss();
                  return false;
                });
              }
              else{
                this.toastMsj("Error eliminando datos: 1002");
                this.popLoading.dismiss();
                return false;
              }
            }).catch(error=>{
              this.toastMsj("Error guardando datos: 1001");
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
    const prompt = this.alertCtrl.create({
      title: 'Agregar Coorporación',
      message: "Ingrese los datos de la coorporación " + item.name,
      inputs: [
        {
          name: 'name',
          placeholder: "Nombre nuevo"
        },
        {
          name: 'code',
          placeholder: item.code,
          type:"number"
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Guardar',
          handler: data => {
            this.presentLoading("Guardando");
            if(data.name.length > 0 && data.code.length > 0){
              let UserCoorpF = Parse.Object.extend("CustomersCoorp");
              let queryFindCoorpsCode = new Parse.Query(UserCoorpF);
              queryFindCoorpsCode.equalTo("code", data.code);
              queryFindCoorpsCode.equalTo("deleted", false);
              
              queryFindCoorpsCode.find()
              .then(resFind=>{
                if(resFind.length > 0){
                  this.toastMsj("Ya existe una coorporación con el mismo código");
                  this.popLoading.dismiss();
                }
                else{
                  let query = new Parse.Query(UserCoorpF);
                  query.equalTo("objectId", item.id);

                  query.find()
                  .then(coorps =>{
                    if(coorps.length > 0){
                      coorps[0].set("name", data.name);
                      coorps[0].set("code", data.code);
        
                      coorps[0].save()
                      .then(results =>{ 
                        this.popLoading.dismiss();
                        this.toastMsj("Datos guardados correctamente");
                        this.getCoorps();
                      }).catch(error => {
                        this.toastMsj("Error guardando datos: 1002");
                        this.popLoading.dismiss();
                        return false;
                      });
                    }
                    else{
                      this.toastMsj("Error guardando datos: 1004");
                      this.popLoading.dismiss();
                      return false;
                    }
                  }).catch(error=>{
                    this.toastMsj("Error guardando datos: 1003");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
              }).catch(error=>{
                this.toastMsj("Error guardando datos: 1001");
                this.popLoading.dismiss();
                return false;
              });
            }
            else if(data.code.length > 0){
              let UserCoorpF = Parse.Object.extend("CustomersCoorp");
              let queryFindCoorpsCode = new Parse.Query(UserCoorpF);
              queryFindCoorpsCode.equalTo("code", data.code);
              queryFindCoorpsCode.equalTo("deleted", false);
              
              queryFindCoorpsCode.find().then(resFind=>{
                if(resFind.length > 0){
                  this.toastMsj("Ya existe una coorporación con el mismo código");
                  this.popLoading.dismiss();
                }
                else{
                  let query = new Parse.Query(UserCoorpF);
                  query.equalTo("objectId", item.id);

                  query.find()
                  .then(coorps =>{
                    if(coorps.length > 0){
                      coorps[0].set("code", data.code);
        
                      coorps[0].save()
                      .then(results =>{ 
                        this.popLoading.dismiss();
                        this.toastMsj("Datos guardados correctamente");
                        this.getCoorps();
                      }).catch(error => {
                        this.toastMsj("Error guardando datos: 1002");
                        this.popLoading.dismiss();
                        return false;
                      });
                    }
                    else{
                      this.toastMsj("Error guardando datos: 1004");
                      this.popLoading.dismiss();
                      return false;
                    }
                  }).catch(error=>{
                    this.toastMsj("Error guardando datos: 1003");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
              }).catch(error=>{
                this.toastMsj("Error guardando datos: 1001");
                this.popLoading.dismiss();
                return false;
              });
            }
            else if(data.name.length > 0){
              let UserCoorpF = Parse.Object.extend("CustomersCoorp");
              let query = new Parse.Query(UserCoorpF);
              query.equalTo("objectId", item.id);

              query.find()
              .then(coorps =>{
                if(coorps.length > 0){
                  coorps[0].set("name", data.name);
    
                  coorps[0].save()
                  .then(results =>{ 
                    this.popLoading.dismiss();
                    this.toastMsj("Datos guardados correctamente");
                    this.getCoorps();
                  }).catch(error => {
                    this.toastMsj("Error guardando datos: 1002");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
                else{
                  this.toastMsj("Error guardando datos: 1004");
                  this.popLoading.dismiss();
                  return false;
                }
              }).catch(error=>{
                this.toastMsj("Error guardando datos: 1003");
                this.popLoading.dismiss();
                return false;
              });
            }
            else{
              return false;
            }
          }
        }
      ]
    });
    prompt.present();
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
