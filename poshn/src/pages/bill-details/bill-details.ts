import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
/**
 * Generated class for the BillsListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 import Parse from 'parse'

@IonicPage()
@Component({
  selector: 'page-bill-details',
  templateUrl: 'bill-details.html',
})
export class BillDetailsPage {
  itemsFactura: Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>;
  
  customers: Array<{id:any, name:string, lastName:string, code:number, email:string,  select:boolean}>;

  cobros:Array<{id:any, name:string, type:string, nombreTipoPago:string}>;

  cantidadProductosFactura = 0;
  totalFactura = 0;
  caiFactura = null;
  idFacturaCargada;
  clienteAdjunto;
  facturaCargada = false;
  typeCobro:any;
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
    console.log('ionViewDidLoad BillDetailsPage');
    this.getClientes(false);
    this.getTiposCobro();
    this.itemsFactura = this.navParams.get("itemsBill");
    
    if(this.itemsFactura != null)
      this.updateDataGeneralProforma();
    else
      this.toastMsj("Error cargando datos de factura");
  }

  updateDataGeneralProforma(){
    let total = 0;
    this.itemsFactura.forEach(element => {
      total += element.quantity*element.price;
    });

    this.totalFactura = total;

    this.cantidadProductosFactura = this.itemsFactura.length;

    if(this.cantidadProductosFactura < 1)      
      this.toastMsj("Error cargando productos")
  }

  getClientes(modificacion){
    this.customers = Array<{id:any, name:string, lastName:string, code:number, email:string, select:boolean}>();
    this.customers.push({id:-1, name:"Consumidor", lastName:"final", code:0, email:"N/A", select:true});

    let Customers = Parse.Object.extend("Customers");
    let qFindCustomers = new Parse.Query(Customers);
    qFindCustomers.equalTo("deleted", false);
    qFindCustomers.ascending("name");

    qFindCustomers.find()
    .then(results=>{
      results.forEach(element => {
        this.customers.push({id:element.id, 
                            name:element.get("name"), 
                            lastName:element.get("lastName"), 
                            code:element.get("code"),
                            email:element.get("email"),
                            select:false});
      });
    }).catch(error=>{
      this.toastMsj("Error obteniendo clientes");
    });
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
          this.cobros.push({id:element.id, name:element.get("name"), type:element.get("typeCobro"), nombreTipoPago:"Pago de contado"});
        else{
          this.cobros.push({id:element.id, name:element.get("name"), type:element.get("typeCobro"), nombreTipoPago:"Abono a cuentas"});
        }
      });

      if(this.cobros.length < 1)
        this.toastMsj("No existen tipos de cobro guardados");

    }).catch(error=>{
      this.toastMsj("Error obteniendo datos");
    });
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
