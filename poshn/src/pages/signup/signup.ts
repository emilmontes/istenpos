import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';


/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 import Parse from 'parse'

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  coorporaciones:Array<{id:any, name:string, select:boolean}>;
  coorpId:any;
  popLoading:any;
  name:string;
  lastName:string;
  email:string;
  code:string;
  userId:any;
  coorpIdRecibido:any;
  userEncontrado = false;
  typeRegister:string;

  selectedOptionCoorp= {
    title: 'Coorporaciones',
    subTitle: 'Seleccione una coorporación',
    mode: 'md'
  };

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public viewCtrl:ViewController) {
    
  }

  dismiss() {
    // Returning data from the modal:
      this.viewCtrl.dismiss(
          // Whatever should be returned, e.g. a variable name:
          { name : this.name } 
      );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
    this.userId = this.navParams.get("userId");

    if(this.userId != null)
    {
      this.typeRegister = "Guardar"
      this.presentLoading("Cargando datos");
      let Customers = Parse.Object.extend("Customers");
      let queryFind = new Parse.Query(Customers);
      queryFind.equalTo("objectId", this.userId);

      queryFind.find()
      .then(results=>{
        if(results.length > 0){
          this.userEncontrado = true;
          this.name = results[0].get("name");
          this.lastName = results[0].get("lastName");
          this.email = results[0].get("email");
          this.code = results[0].get("code");
          this.coorpIdRecibido = results[0].get("coorpId");
          this.popLoading.dismiss();
          
          this.getCoorporaciones();
        }
        else{
          this.userEncontrado = false;
          this.popLoading.dismiss();
        }
      })
      .catch(error=>{
        this.toastMsj("Error obteniendo datos de cliente");
        this.userEncontrado = false;
        this.popLoading.dismiss();
      });
    }
    else{
      this.typeRegister = "Registrar"
      this.getCoorporaciones();
    }
  }

  getCoorporaciones(){
    this.coorporaciones = Array<{id:any, name:string, select:boolean}>();

    let Coorps = Parse.Object.extend("UsersCoorp");
    let qFind = new Parse.Query(Coorps);
    qFind.equalTo("deleted", false);

    qFind.find()
    .then(results=>{
      results.forEach(element => {
        if(element.id==this.coorpIdRecibido){
          this.coorporaciones.push({id:element.id, name:element.get("name"),select:true});
        }else
          this.coorporaciones.push({id:element.id, name:element.get("name"),select:false});
      });
    })
    .catch(error=>{

    });
  }

  createCustomer(){

    if(this.name == null || this.name.trim().length < 1)
      this.toastMsj("El nombre es un campo obligatorio");
    else if(this.lastName == null || this.lastName.trim().length < 1)
      this.toastMsj("El apellido es un campo obligatorio");
    else if(this.email == null || this.email.trim().length < 1)
      this.toastMsj("El email es un campo obligatorio");
    else if(this.code == null || this.code.trim().length < 1)
      this.toastMsj("El codigo es un campo obligatorio");
    else{
      this.presentLoading("Guardando datos");
      if(this.userId != null){
        let Customer = Parse.Object.extend("Customers");
        
        let qFindCode = new Parse.Query(Customer);
        qFindCode.equalTo("code", this.code);
        qFindCode.notEqualTo("objectId", this.userId);

        qFindCode.find()
        .then(results =>{
          if(results.length > 0){
            this.popLoading.dismiss();
            this.toastMsj("Error, existe cliente con el mismo código");
          }
          else{
            let queryFind = new Parse.Query(Customer);
            queryFind.equalTo("objectId", this.userId);

            queryFind.find()
            .then(results=>{
              if(results.length > 0){
                results[0].set("name", this.name);
                results[0].set("lastName", this.lastName);
                results[0].set("email", this.email);
                results[0].set("code", this.code);
                results[0].set("coorpId", this.coorpIdRecibido);

                results[0].save()
                .then(customer=>{
                  this.popLoading.dismiss();
                  this.toastMsj("Datos actualzado correctamente");
                })
                .catch(error=>{
                  this.popLoading.dismiss();
                  this.toastMsj("Error actualzado datos. 1001");
                });
              }
              else{
                this.popLoading.dismiss();
                this.toastMsj("Error actualzado datos. 1002");
              }
            }).catch(error=>{
              this.popLoading.dismiss();
              this.toastMsj("Error actualzado datos. 1003");
            });
          }
        }).catch(error=>{
          this.toastMsj("Error creando cliente");
          this.popLoading.dismiss();
        });
      }
      else{
        let Customer = Parse.Object.extend("Customers");
        
        let qFindCode = new Parse.Query(Customer);
        qFindCode.equalTo("code", this.code);

        qFindCode.find()
        .then(results =>{
          if(results.length > 0){
            this.popLoading.dismiss();
            this.toastMsj("Error, existe cliente con el mismo código");
          }
          else{
            let customer = new Customer();
      
            customer.set("name", this.name);
            customer.set("lastName", this.lastName);
            customer.set("email", this.email);
            customer.set("code", this.code);
            customer.set("coorpId", this.coorpId);
            customer.set("deleted", false);
      
            customer.save()
            .then(result=>{
              this.toastMsj("Cliente creado correctamente");
              this.popLoading.dismiss();
            })
            .catch(error=>{
              this.toastMsj("Error creando cliente");
              this.popLoading.dismiss();
            });
          }
        })
        .catch(error=>{
          this.toastMsj("Error creando cliente");
          this.popLoading.dismiss();
        });
      }
    }
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
