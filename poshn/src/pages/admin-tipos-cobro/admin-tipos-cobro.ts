import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import Parse from 'parse'

/**
 * Generated class for the AdminTiposCobroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { AddCobroPage } from '../add-cobro/add-cobro';

@IonicPage()
@Component({
  selector: 'page-admin-tipos-cobro',
  templateUrl: 'admin-tipos-cobro.html',
})
export class AdminTiposCobroPage {
  popLoading:any;
  cobros:Array<{id:any, name:string, type:string, nombreTipoPago:string}>;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminTiposCobroPage');
    this.getTiposCobro();
  }

  getTiposCobro(){
    this.cobros = Array<{id:any, name:string, type:string, nombreTipoPago:string}>();
    let Cobro = Parse.Object.extend("TiposCobro");
    let query = new Parse.Query(Cobro);
    query.equalTo("deleted", false);

    query.find()
    .then(results=>{
      results.forEach(element => {
        if(element.get("typeCobro") == '1')
          this.cobros.push({id:element.id, name:element.get("name"), type:element.get("typeCobro"), nombreTipoPago:"De contado"});
        else{
          this.cobros.push({id:element.id, name:element.get("name"), type:element.get("typeCobro"), nombreTipoPago:"A cuentas"});
        }
      });

      if(this.cobros.length < 1)
        this.toastMsj("No existen tipos de cobro guardados");

    }).catch(error=>{
      this.toastMsj("Error obteniendo datos");
    });
  }

  addNewCobro(){
    let profileModal = this.modalCtrl.create(AddCobroPage);

    profileModal.onDidDismiss(date=>{
      this.getTiposCobro();
    })

    profileModal.present();
  }

  deleteCobro(item){
    let alert = this.alertCtrl.create({
      title: 'Confirme eliminaccion',
      message: '¿Desea elminar el cobro <b>' + item.name + '</b> de manera permanente?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            let Cobro = Parse.Object.extend("TiposCobro");
            let query = new Parse.Query(Cobro);
            query.equalTo("objectId", item.id);

            query.find()
            .then(results=>{
              if(results.length > 0){
                results[0].set("deleted", true);

                results[0].save()
                .then(res=>{
                  this.toastMsj("Cobro eliminado correctamente");
                  this.getTiposCobro();
                }).catch(error=>{
                  this.toastMsj("Error actualizando datos: 1001"); 
                });
              }
              else{
                this.toastMsj("Error actualizando datos: 1002");                
              }
            }).catch(error=>{
              this.toastMsj("Error actualizando datos: 1003");
            });
          }
        }
      ]
    });
    alert.present();
  }

  updateCobro(item){
    let profileModal = this.modalCtrl.create(AddCobroPage, {'esEdicion':true, 'idCobro':item.id, 'nameCobro':item.name, 'typeCobro':item.type});

    profileModal.onDidDismiss(date=>{
      this.getTiposCobro();
    })
    
    profileModal.present();
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
