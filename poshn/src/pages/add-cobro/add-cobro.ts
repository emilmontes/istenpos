import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import Parse from 'parse'

@IonicPage()
@Component({
  selector: 'page-add-cobro',
  templateUrl: 'add-cobro.html',
})
export class AddCobroPage {

  nameCobro:string;
  typeCobro:string;
  esEdicion:boolean;
  idCobro:string;
  popLoading:any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddCobroPage');
    this.idCobro = this.navParams.get("idCobro");
    this.esEdicion = this.navParams.get("esEdicion");
    this.nameCobro = this.navParams.get("nameCobro");
    this.typeCobro = this.navParams.get("typeCobro");
  }

  saveCobro(){
    if(this.nameCobro == null || this.nameCobro.trim().length < 1)
      this.toastMsj("El nombre es un campo obligatorio");
    else if(this.typeCobro == null)
      this.toastMsj("Debe elejir el  tipo de cobro");
    else if(this.esEdicion){
      let Cobro = Parse.Object.extend("TiposCobro");
      let query = new Parse.Query(Cobro);
      query.equalTo("deleted", false);
      query.equalTo("name", this.nameCobro);
      query.equalTo("typeCobro", this.typeCobro);
      query.notEqualTo("objectId", this.idCobro);

      query.count().then(count=>{
        if(count > 0){
          this.toastMsj("El tipo de cobro ya existe");
        }
        else{
          let queryFind = new Parse.Query(Cobro);
          queryFind.equalTo("objectId", this.idCobro);

          queryFind.find()
          .then(cobroFind=>{
            if(cobroFind.length > 0){
              cobroFind[0].set("name", this.nameCobro);
              cobroFind[0].set("typeCobro", this.typeCobro);
              cobroFind[0].save()
              .then(cobroSave=>{
                this.toastMsj("Cobro actualizado correctamente");
              }).catch(error=>{
                this.toastMsj("Error actualizando datos: 1003");
              });
            }
            else
              this.toastMsj("Error actualizando datos: 1002");
          }).catch(error=>{
            this.toastMsj("Error actualizando datos: 1004");
          });
        }
      })
      .catch(error=>{
        this.toastMsj("Error actualizando datos: 1001");
      });
    }
    else{
      let Cobro = Parse.Object.extend("TiposCobro");
      let query = new Parse.Query(Cobro);
      query.equalTo("deleted", false);
      query.equalTo("name", this.nameCobro);
      query.equalTo("typeCobro", this.typeCobro);

      query.count().then(count=>{
        if(count > 0){
          this.toastMsj("El tipo de cobro ya existe");
        }
        else{
          let cobroNuevo = new Cobro();
          cobroNuevo.set("name", this.nameCobro);
          cobroNuevo.set("typeCobro", this.typeCobro);
          cobroNuevo.set("deleted", false);

          cobroNuevo.save()
          .then(cobroFind=>{
            this.toastMsj("Cobro creado correctamente");
          }).catch(error=>{
            this.toastMsj("Error creando cobro: 1004");
          });
        }
      })
      .catch(error=>{
        this.toastMsj("Error creando cobro: 1001");
      });
    }
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
