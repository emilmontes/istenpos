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
  selector: 'page-bills-list',
  templateUrl: 'bills-list.html',
})
export class BillsListPage {
  popLoading;
  facturas: Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>;
  
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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BillsListPage');
    this.getClientes(false);
    this.getFacturas();
    this.getTiposCobro();
  }

  pagarFactura(){
    if(this.facturaCargada){
      if(this.clienteAdjunto != -1){
        this.customers.forEach(element => {
          
        });
      }
      else
        console.log("Consumidorfinal");
    }
    else{
      this.toastMsj("Debe cargar una factura");
    }
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

  confirmarDatosCliente(){
    if(this.clienteAdjunto != -1){
      this.customers.forEach(element => {
        if(element.id == this.clienteAdjunto){
          element.select = true;
          const prompt = this.alertCtrl.create({
            title: 'Confirme datos',
            message: "Confirme datos del cliente, si desea guardar cambios precione guardar",
            inputs: [
              {
                name: 'name',
                placeholder: element.name
              },
              {
                name: 'lastName',
                placeholder: element.lastName
              },
              {
                name: 'email',
                placeholder: element.email
              },
              {
                name: 'code',
                placeholder: "" + element.code
              }
            ],
            buttons: [
              {
                text: 'Adjuntar',
                handler: data => {
                  
                }
              },
              {
                text: 'Guardar',
                handler: data => {
                  if(data.name.length < 1)
                    data.name = element.name;
                  if(data.lastName.trim().length < 1)
                    data.lastName = element.lastName;
                  if(data.email.trim().length < 1)
                    data.email = element.email;
                  if(data.code.trim().length < 1)
                    data.code = element.code;
                    
                  this.presentLoading("Guardando datos");
                  
                  let Customer = Parse.Object.extend("Customers");
                  
                  let qFindCode = new Parse.Query(Customer);
                  qFindCode.equalTo("code", data.code);
                  qFindCode.notEqualTo("objectId", element.id);

                  qFindCode.find()
                  .then(results =>{
                    if(results.length > 0){
                      this.popLoading.dismiss();
                      this.toastMsj("Error, existe cliente con el mismo código");
                      return false;
                    }
                    else{
                      let queryFind = new Parse.Query(Customer);
                      queryFind.equalTo("objectId", element.id);

                      queryFind.find()
                      .then(results=>{
                        if(results.length > 0){
                          results[0].set("name", data.name);
                          results[0].set("lastName", data.lastName);
                          results[0].set("email", data.email);
                          results[0].set("code", data.code);

                          results[0].save()
                          .then(customer=>{
                            this.popLoading.dismiss();
                            this.toastMsj("Datos actualzado correctamente");
                            //this.getClientes(true);
                          })
                          .catch(error=>{
                            this.popLoading.dismiss();
                            this.toastMsj("Error actualzado datos. 1001");
                            return false;
                          });
                        }
                        else{
                          this.popLoading.dismiss();
                          this.toastMsj("Error actualzado datos. 1002");
                          return false;
                        }
                      }).catch(error=>{
                        this.popLoading.dismiss();
                        this.toastMsj("Error actualzado datos. 1003");
                        return false;
                      });
                    }
                  }).catch(error=>{
                    this.toastMsj("Error creando cliente");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
              }
            ]
          });
          prompt.present();          
        }
      });
    }
  }

  getFacturas(){    
    this.presentLoading("Cargando Proformas");
    this.itemsFactura = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
    this.facturas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();

    let Invoice = Parse.Object.extend("Invoices");
    let qInvoices = new Parse.Query(Invoice);
    qInvoices.equalTo("deleted", false);
    qInvoices.equalTo("proforma", false);

    qInvoices.find()
    .then(results=>{
      if(results.length < 1){
        this.popLoading.dismiss();
      }else{
        this.popLoading.dismiss();
        results.forEach(element => {
          let Item = Parse.Object.extend("invoiceItems");
          let qitems = new Parse.Query(Item);
          qitems.equalTo("invoice", element);
  
          qitems.count()
          .then(count=>{  
            let date = element.get("createdAt");
  
            let day = date.getDate();
            let monthIndex = date.getMonth();
            let year = date.getFullYear();
            let minutes = date.getMinutes();
            let hours = date.getHours();
            //let seconds = date.getSeconds();
            let myFormattedDate = day + "/" + (monthIndex+1) + "/" + year + ", " + hours + ":"+minutes;//+":"+seconds;
            
            this.facturas.push({id:element.id, cantidadProductos:count, totalFacturado:element.get("total"), fecha: myFormattedDate, identificador:element.get("identificador")});
          })
          .catch(errorP=>{
            this.popLoading.dismiss();
            this.toastMsj("Error obteniendo proformas");
            this.facturas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();
          });
        });        
      }
    })
    .catch(error=>{
      this.popLoading.dismiss();
      this.toastMsj("Error obteniendo proformas");
      this.facturas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();
    });
  }

  cargarFactura(item){
    this.presentLoading("Cargando datos");
    this.itemsFactura = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
    this.cantidadProductosFactura = 0;
    this.totalFactura = 0;
    this.caiFactura = null;

    let Invoice = Parse.Object.extend("Invoices");
    let qInvoices = new Parse.Query(Invoice);
    qInvoices.equalTo("deleted", false);
    qInvoices.equalTo("proforma", false);
    qInvoices.equalTo("objectId", item.id);

    qInvoices.find()
    .then(results=>{
      if(results.length < 1){
        this.toastMsj("Error cargando factura");
        this.popLoading.dismiss();
      }
      else{
        this.totalFactura = results[0].get("total");
        this.caiFactura = results[0].get("cai");

        this.idFacturaCargada = item.id;

        let Item = Parse.Object.extend("invoiceItems");
        let qitems = new Parse.Query(Item);
        qitems.equalTo("invoice", results[0]);

        qitems.find()
        .then(items =>{

          items.forEach(element => {
            this.itemsFactura.push({id:element.id, 
                                nameProduct:element.get("nameProduct"),
                                price:element.get("priceProduct"),
                                quantity:element.get("quantity"),
                                icon:"checkbox", 
                                iconColor:"secondary", 
                                saved:true});            
          });

          this.popLoading.dismiss();
          this.facturaCargada = true;
          this.cantidadProductosFactura = this.itemsFactura.length;
        })
        .catch(errorP=>{
          this.popLoading.dismiss();
          this.toastMsj("Error obteniendo proforma");
          this.itemsFactura = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
          this.cantidadProductosFactura = 0;
          this.totalFactura = 0;
          this.caiFactura = null;
        });     
      }
    })
    .catch(error=>{
      this.popLoading.dismiss();
      this.toastMsj("Error obteniendo proformas");
      this.itemsFactura = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
      this.cantidadProductosFactura = 0;
      this.totalFactura = 0;
      this.caiFactura = null;
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
