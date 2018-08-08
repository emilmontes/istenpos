import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { LoginPage } from '../login/login'
import { SignupPage } from '../signup/signup'
import { BillDetailsPage } from '../bill-details/bill-details'

import Parse from 'parse';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  home = "menuPrincipal";
  customers: Array<{id:any, name:string, lastName:string, email:string, code:string, coorpId:any}>;
  /******************************/
  /* LOGICA MENU */
  /******************************/
  title:string;
  categories: Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string }>
  products: Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string, price:number }>
  subCat = false;
  nameCategoria:string;
  idCategoria:any;
  nameCategoriaPadre:string;
  idCategoriaPadre:any;
  childExists = false;
  lastCategory = false;
  childProductsExists = false;
  popLoading:any;
  popLoading2:any;
  popLoading3:any;
  childExistsSubcat = true;
  identificadorProforma:string;
  identificadorProformaCargada:string;

  /******************************/
  /* LOGICA PROFORMAS */
  /******************************/
  //ITEMS AGREGADOS A CUENTA NUEVA EN MENU
  itemsBill: Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>;
  
  //ITEMS EN PROFORMA CARGADA EN TAB PROFORMAS
  itemsProforma: Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>;
  
  //ITEMS ORIGINALES AL CARGARSE UNA PROFORMA EN EL MENU DE PRODUCTOS
  itemsProformaCargadaGuardados: Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>;
  
  cantidadProductosProforma = 0;
  totalProformaActual = 0;
  cai:string;
  proformaCargadaMenu = false;

  cantidadProductosProformaCargada = 0;
  totalProformaCargada = 0;
  caiProformaCargada;
  idProformaCargada:any;
  idProformaCargadaMenu:any;

  // PARA MOSTRAR LABEL DE IDENTIFICACIÓN DE PROFORMA
  productosEnProforma = false;

  proformas:Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>;

  images:Array<{image:string}> = [{image:"assets/imgs/food_blue.png"},
                                  {image:"assets/imgs/food_orange.png"},
                                  {image:"assets/imgs/food_red.png"},
                                  {image:"assets/imgs/food_green2.png"}];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController,
              public modalCtrl: ModalController) {
              
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad CategoriesPage');
    this.title = this.navParams.get("title") || "Categorias";
    this.subCat = this.navParams.get("subcat");
    this.nameCategoria = this.navParams.get("title");
    this.nameCategoriaPadre = this.navParams.get("nameCategoriaPadre");
    this.idCategoria = this.navParams.get("idCategoria");
    this.idCategoriaPadre = this.navParams.get("idCategoriaPadre");
    this.menuCtrl.enable(true, "myMenu");
    this.cai = "0258-89-456221-dsdf-aqrw";
    this.getCategoriasChild();
  }

  getCategoriasChild(){
    this.presentLoading("Cargando datos");
    //console.log("idSubcategoria: " + this.idCategoria);
    if(!this.subCat){
      this.categories = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string}>();
      this.products = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string, price:number }>();

      let Categoria = Parse.Object.extend("Categories");
      let queryCat = new Parse.Query(Categoria);
      queryCat.equalTo("parent", null);
      queryCat.equalTo("deleted", false);
      queryCat.ascending("name");

      queryCat.find()
      .then(results=>{        
        //console.log("categorias en base: " + results.length);
        let j = 0;
        results.forEach(element => {
          this.categories.push({id:element.id, name:element.get("name"), idCategoriaPadre:null, nameCategoriaPadre: "Categoria principal", image:null});
          
          if(j == 0)          
            this.getProductsChild();

          j = 1;
          this.idCategoria = this.categories[0].id;
          
          if(this.categories.length > 0)
            this.childExists = true;
          else{
            this.childExists = false;
          }
          this.lastCategory = false;

          let i = 0;
          this.categories.forEach(element => {
            if(i%4 == 0)
              element.image = this.images[3].image;
            else if(i%3 == 0)
              element.image = this.images[2].image;
            else if(i%2 == 0)
              element.image = this.images[1].image;
            else
              element.image = this.images[0].image;
            //console.log("imagen: " + element.image);
            i++;
          });
        });      

        this.popLoading.dismiss();
      }).catch(error=>{
        this.toastMsj("Error obteniendo categorias");
        this.childExists = false;
        this.popLoading.dismiss();
      });
      this.childExistsSubcat = true;
    }
    else{
      //this.menuCtrl.enable(false, "myMenu");
      this.categories = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string}>();
      this.products = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string , price:number}>();
      
      let Categoria = Parse.Object.extend("Categories");
      let queryCat = new Parse.Query(Categoria);
      queryCat.equalTo("objectId", this.idCategoria);
      queryCat.ascending("name");

      queryCat.find()
      .then(results=>{
        let j = 0;
        if(results.length > 0){
          let querySubCategories = new Parse.Query(Categoria);
          querySubCategories.equalTo("parent", results[0]);
          querySubCategories.equalTo("deleted", false);

          if(j == 0)          
            this.getProductsChild();
            
          j = 1;

          querySubCategories.find()
          .then(subCats =>{
            //console.log("subcategorias: " + subCats.length);
            subCats.forEach(element => {
              this.categories.push({id:element.id, name:element.get("name"), idCategoriaPadre:this.idCategoria, nameCategoriaPadre: results[0].get("name"), image:null});
              this.idCategoria = this.categories[0].id;
            });
            this.popLoading.dismiss();

            if(subCats.length > 0){
              this.childExists = true;
              this.childExistsSubcat = true;
              this.lastCategory = false;
            }
            else{
              this.childExists = false;
              this.childExistsSubcat = false;
              this.lastCategory = true;
              this.categories.push({id:results[0].id, name:results[0].get("name"), idCategoriaPadre:this.idCategoria, nameCategoriaPadre: results[0].get("name"), image:null})
            }

            let i = 0;
            this.categories.forEach(element => {
              if(i%4 == 0)
                element.image = this.images[3].image;
              else if(i%3 == 0)
                element.image = this.images[2].image;
              else if(i%2 == 0)
                element.image = this.images[1].image;
              else
                element.image = this.images[0].image;

              i++;
            });
          }).catch(error=>{            
            this.toastMsj("Error buscando subcategorias");
            this.popLoading.dismiss();
            this.childExistsSubcat = true;
          });
        }
        else{
          this.popLoading.dismiss();
          this.toastMsj("Error buscando categoria: 1001");
          this.childExistsSubcat = true;
        }
      }).catch(error=>{
        this.toastMsj("Error buscando categoria: 1002");
        this.popLoading.dismiss();
        this.childExistsSubcat = true;
      });
    }
  }

  getProductsChild(){
    if(this.idCategoria != null){
      let Categories = Parse.Object.extend("Categories");
      let queryFindCategoy = new Parse.Query(Categories);
      queryFindCategoy.equalTo("objectId", this.idCategoria);

      queryFindCategoy.find()
      .then(results =>{  
        if(results.length > 0){    
          let Products = Parse.Object.extend("Products");
          let queryProducts = new Parse.Query(Products);
          queryProducts.equalTo("category", results[0]);
          queryProducts.ascending("name");
          this.products = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string, price:number }>();
          
          queryProducts.find()
          .then(productsQuery =>{
            productsQuery.forEach(element => {
              this.products.push({id:element.id, 
                                  name:element.get("name"), 
                                  idCategoriaPadre:this.idCategoria, 
                                  nameCategoriaPadre:this.nameCategoriaPadre, 
                                  image:null,
                                  price:element.get("price")});
              this.childProductsExists = true;
            });
            let i = 0;
            this.products.forEach(element => {
              if(i%4 == 0)
                element.image = this.images[3].image;
              else if(i%3 == 0)
                element.image = this.images[2].image;
              else if(i%2 == 0)
                element.image = this.images[1].image;
              else
                element.image = this.images[0].image;

              i++;
            });

          })
          .catch(errorP => {

          });
        }  
      }).catch(error=>{});
    }
    else
      this.childProductsExists = false;
  }

  addItemProduct(item){
    if(this.itemsBill == null){
      this.itemsBill = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean, identficador:string}>();
      this.cantidadProductosProforma = 0;
      this.totalProformaActual = 0;

      let encontrado = false;
  
      this.itemsBill.forEach(element => {
        if(item.id == element.id)
          encontrado = true;
      });
  
      if(encontrado){
        this.itemsBill.forEach(element => {
          if(item.id == element.id){
            element.quantity++;
            element.icon = "cloud-upload";
            element.iconColor = "danger";
            this.toastMsj("Producto agregado correctamente");
          }
        });
      }
      else{
        this.itemsBill.push({id:item.id, nameProduct:item.name, price:item.price, quantity:1, icon:"cloud-upload", iconColor:"danger", saved:false});
        this.toastMsj("Producto agregado correctamente");
      }
  
      this.updateDataGeneralProforma();
    }
    else{
      let encontrado = false;
  
      this.itemsBill.forEach(element => {
        if(item.id == element.id)
          encontrado = true;
      });
  
      if(encontrado){
        this.itemsBill.forEach(element => {
          if(item.id == element.id){
            element.quantity++;
            element.icon = "cloud-upload";
            element.iconColor = "danger";
            this.toastMsj("Producto agregado correctamente");
          }
        });
      }
      else{
        this.itemsBill.push({id:item.id, nameProduct:item.name, price:item.price, quantity:1, icon:"cloud-upload", iconColor:"danger", saved:false});
        this.toastMsj("Producto agregado correctamente");
      }
  
      this.updateDataGeneralProforma();
    }
  }
  
  removeItemProduct(item){
    if(this.itemsBill == null)
      this.toastMsj("Genere un nuevo pedido");
    else{
      let encontrado = false;
      let idEncontrado;
  
      this.itemsBill.forEach(element => {
        if(item.id == element.id){
          encontrado = true;
          idEncontrado = element.id;
        }
      });
  
      if(encontrado){
        let temp = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
  
        this.itemsBill.forEach(element => {
          if(element.id != idEncontrado)
            temp.push(element);
          else{
            if(element.quantity > 1){
              element.quantity--;
              element.icon = "cloud-upload";
              element.iconColor = "danger";
              temp.push(element);
            }
            this.toastMsj("Producto removido correctamente");
          }
        });
  
        this.itemsBill= temp;
        this.updateDataGeneralProforma();
      }

    }
  }

  newPedido(){
    this.itemsBill = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean, identficador:string}>();
    this.itemsProformaCargadaGuardados = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean, identficador:string}>();
    this.cantidadProductosProforma = 0;
    this.totalProformaActual = 0;
    this.proformaCargadaMenu = false;
    this.identificadorProforma = null;
    this.productosEnProforma = false;
  }

  removeProformaCargada(){
    this.itemsProforma = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
    this.cantidadProductosProformaCargada = 0;
    this.totalProformaCargada = 0;
    this.caiProformaCargada = null;
    this.idProformaCargada = null;
  }  

  updateDataGeneralProforma(){
    let total = 0;
    this.itemsBill.forEach(element => {
      total += element.quantity*element.price;
    });

    this.totalProformaActual = total;

    this.cantidadProductosProforma = this.itemsBill.length;

    if(this.cantidadProductosProforma > 0)      
      this.productosEnProforma = true;
    else    
      this.productosEnProforma = false;
  }

  cargarProforma(item){
    this.itemsProforma = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
    this.cantidadProductosProformaCargada = 0;
    this.totalProformaCargada = 0;
    this.caiProformaCargada = null;
    this.idProformaCargada = null;

    let Invoice = Parse.Object.extend("Invoices");
    let qInvoices = new Parse.Query(Invoice);
    qInvoices.equalTo("deleted", false);
    qInvoices.equalTo("proforma", true);
    qInvoices.equalTo("objectId", item.id);

    qInvoices.find()
    .then(results=>{
      if(results.length < 1)
        this.toastMsj("Error cargando proforma");
        //this.popLoading.dismiss();
      else{
        this.totalProformaCargada = results[0].get("total");
        this.caiProformaCargada = results[0].get("cai");
        this.identificadorProformaCargada = results[0].get("identificador");

        this.idProformaCargada = item.id;

        let Item = Parse.Object.extend("invoiceItems");
        let qitems = new Parse.Query(Item);
        qitems.equalTo("invoice", results[0]);
        let loading = true;

        qitems.find()
        .then(items =>{
          console.log("leyendo datos");
          if(loading){
            //this.popLoading.dismiss();
            loading = false;
          }

          items.forEach(element => {
            this.itemsProforma.push({id:element.id, 
                                nameProduct:element.get("nameProduct"),
                                price:element.get("priceProduct"),
                                quantity:element.get("quantity"),
                                icon:"checkbox", 
                                iconColor:"secondary", 
                                saved:true});            
          });

          this.cantidadProductosProformaCargada = this.itemsProforma.length;
        })
        .catch(errorP=>{
          //this.popLoading.dismiss();
          this.toastMsj("Error obteniendo proforma");
          this.itemsProforma = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
          this.cantidadProductosProformaCargada = 0;
          this.totalProformaCargada = 0;
          this.caiProformaCargada = null;
          this.idProformaCargada = null;
        });     
      }
    })
    .catch(error=>{
      //this.popLoading.dismiss();
      this.toastMsj("Error obteniendo proformas");
      this.itemsProforma = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
      this.cantidadProductosProformaCargada = 0;
      this.totalProformaCargada = 0;
      this.caiProformaCargada = null;     
    });

  }

  cargarEnMenu(){
    if(this.itemsProforma == null  || this.itemsProforma.length < 1)
      this.toastMsj("Cargue una proforma");
    else{
      this.itemsBill = this.itemsProforma;
      this.cai = this.caiProformaCargada;
      this.proformaCargadaMenu = true;
      this.idProformaCargadaMenu = this.idProformaCargada;    
      this.itemsProformaCargadaGuardados = this.itemsProforma;
      this.identificadorProforma = this.identificadorProformaCargada;

      this.updateDataGeneralProforma();
      this.toastMsj("Proforma disponible en menu para modificación");
      //this.removeProformaCargada();
    }
  }

  generarFacturaDesdeProformas(){
    if(this.idProformaCargada == null){
      this.toastMsj("Cargue una proforma para poder generar la factura");
    }
    else{
      let Invoices = Parse.Object.extend("Invoices");
      let query = new Parse.Query(Invoices);;
      query.equalTo("objectId", this.idProformaCargada);

      query.find()
      .then(results=>{
        if(results.length > 0){
          results[0].set("proforma", false);
          results[0].save()
          .then(resultF=>{
            this.getProformas();  
            this.toastMsj("Factura generada correctamente");
            this.idProformaCargada = null
          })
          .catch(errorF=>{
            this.toastMsj("Error generando factura: 1003");
          });
        }
        else{
          this.toastMsj("Error generando factura: 1001");
        }
      }).catch(error=>{
          this.toastMsj("Error generando factura: 1002");
      });      
    }
  }

  getProformas(){    
    this.presentLoading2("Cargando Proformas");
    //this.itemsBill = Array<{id: any, nameProduct:string, price:number, quantity:number, icon:string, iconColor:string, saved:boolean}>();
    
    this.removeProformaCargada();
    this.proformas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();

    let Invoice = Parse.Object.extend("Invoices");
    let qInvoices = new Parse.Query(Invoice);
    qInvoices.equalTo("deleted", false);
    qInvoices.equalTo("proforma", true);

    qInvoices.find()
    .then(results=>{
      if(results.length < 1){
        this.popLoading2.dismiss();
      }else{
        this.popLoading2.dismiss();
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
            
            this.proformas.push({id:element.id, cantidadProductos:count, totalFacturado:element.get("total"), fecha: myFormattedDate, identificador:element.get("identificador")});
          })
          .catch(errorP=>{
            this.popLoading2.dismiss();
            this.toastMsj("Error obteniendo proformas");
            this.proformas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();
          });
        });        
      }
    })
    .catch(error=>{
      this.popLoading2.dismiss();
      this.toastMsj("Error obteniendo proformas");
      this.proformas = Array<{id:any, cantidadProductos:number, totalFacturado:number, fecha:string, identificador:string}>();
    });
  }

  generarProforma(esProforma){
    let procesoCorrecto = true;

    if(this.identificadorProforma == null || this.identificadorProforma.trim().length < 1){
      this.identificadorProforma="N/A"
    }
    
    if(this.proformaCargadaMenu){
      //SE ELIMINAN LOS ITEMS QUE NO ESTAN EN LA LISTA ITEMSBILL
      this.itemsProformaCargadaGuardados.forEach(itemSaved => {
        let encontrado = false;

        this.itemsBill.forEach(element => {
          if(element.id == itemSaved.id)
            encontrado = true;
        });

        if(!encontrado){
          let invoiceItem = Parse.Object.extend("invoiceItems");
          let qFind = new Parse.Query(invoiceItem);

          qFind.equalTo("objectId", itemSaved.id);
          qFind.find()
          .then(results=>{
            if(results.length > 0){
              
              results[0].destroy()
              .catch(error=>{
                procesoCorrecto = false;
                if(esProforma)
                  this.toastMsj("Error actualizando proforma: 1002");
                else
                  this.toastMsj("Error creando factura: 1002");
              });
            }
            else{
              if(esProforma){
                this.toastMsj("Error actualizando proforma: 1001");
                procesoCorrecto = false;
              }
              else{
                this.toastMsj("Error creando factura: 1001");
                procesoCorrecto = false;
              }
            }
          }).catch(error=>{
            if(esProforma){
              this.toastMsj("Error actualizando proforma: 1003");
              procesoCorrecto = false;
            }
            else{
              this.toastMsj("Error creando factura: 1003");
              procesoCorrecto = false;
            }
          });
        }
      });

      //SE GUARDA LA PROFORMA
      let Invoices = Parse.Object.extend("Invoices");
      let query = new Parse.Query(Invoices);

      query.equalTo("objectId", this.idProformaCargadaMenu);
      query.equalTo("deleted", false);

      query.find()
      .then(results=>{
        if(results.length > 0){
          console.log("Total proforma actual en menu: " + this.totalProformaActual);
          results[0].set("total", this.totalProformaActual);
          results[0].set("proforma", esProforma);
          results[0].set("identificador", this.identificadorProforma);

          results[0].save().then(proformSaved=>{
            this.itemsBill.forEach(element => {
              if(element.saved){
                let invoiceItem = Parse.Object.extend("invoiceItems");
                let qFind = new Parse.Query(invoiceItem);
      
                qFind.equalTo("objectId", element.id);
                qFind.find()
                .then(resultsItem=>{
                  if(results.length > 0){
                    resultsItem[0].set("priceProduct", element.price);
                    resultsItem[0].set("quantity", element.quantity);
      
                    resultsItem[0].save().then(itemS=>{
                      element.icon = "checkbox";
                      element.iconColor="secondary";
                    })
                    .catch(error=>{
                      if(esProforma){
                        this.toastMsj("Error actualizando proforma: 1005");
                        procesoCorrecto = false;
                      }
                      else{
                        this.toastMsj("Error creando factura: 1005");
                        procesoCorrecto = false;
                      }
                    });
                  }
                  else{
                    if(esProforma){
                      this.toastMsj("Error actualizando proforma: 1004");
                      procesoCorrecto = false;
                    }
                    else{
                      this.toastMsj("Error creando factura: 1004");
                      procesoCorrecto = false;
                    }
                  }
                }).catch(error=>{
                  if(esProforma){
                    this.toastMsj("Error actualizando proforma: 1006");
                    procesoCorrecto = false;
                  }
                  else{
                    this.toastMsj("Error creando factura: 1006");
                    procesoCorrecto = false;
                  }
                });
              }
              else{
                let invoiceItem = Parse.Object.extend("invoiceItems");
                let item = new invoiceItem();
                item.set("idProduct", element.id);
                item.set("nameProduct", element.nameProduct);
                item.set("priceProduct", element.price);
                item.set("quantity", element.quantity);
                item.set("invoice", results[0]);
                item.set("deleted", false);
      
      
                item.save().then(itemS=>{            
                  element.icon = "checkbox";
                  element.iconColor="secondary";
                })
                .catch(error=>{
                  if(esProforma){
                    this.toastMsj("Error actualizando proforma: 1007");
                    procesoCorrecto = false;
                  }
                  else{
                    this.toastMsj("Error creando factura: 1007");
                    procesoCorrecto = false;
                  }
                });
              }
            });
          })
          .catch(errorP=>{
            procesoCorrecto = false;
            if(esProforma)
              this.toastMsj("Error actualizando proforma: 1009");
            else
              this.toastMsj("Error creando Factura: 1009");
          });
        }
        else if(esProforma){
          this.toastMsj("Error actualizando proforma: 1011");
          procesoCorrecto = false;
        }
        else{
          this.toastMsj("Error creando factura: 1011");
          procesoCorrecto = false;
        }

      }).catch(error=>{
        if(esProforma){
          this.toastMsj("Error actualizando proforma: 1010");
          procesoCorrecto = false;
        }
        else{
          this.toastMsj("Error creado factura: 1010");
          procesoCorrecto = false;
        }
      });

      if(procesoCorrecto){
        if(esProforma)
          this.toastMsj("Proforma generada correctamente");
        else
          this.toastMsj("Factura generada correctamente");  
      }
    }
    else{
      if(this.itemsBill != null && this.itemsBill.length > 0){
        let Invoise = Parse.Object.extend("Invoices");
        let factura = new Invoise();
  
        factura.set("proforma", esProforma);
        factura.set("cai", this.cai);
        factura.set("invoiceNumber", 8);
        factura.set("total", this.totalProformaActual);
        factura.set("deleted", false);
        factura.set("identificador", this.identificadorProforma);
  
        factura.save()
        .then(result=>{
          this.itemsBill.forEach(element => {
            let Items = Parse.Object.extend("invoiceItems");
            let itemInvoice = new Items();
  
            itemInvoice.set("idProduct", element.id);
            itemInvoice.set("nameProduct", element.nameProduct);
            itemInvoice.set("priceProduct", element.price);
            itemInvoice.set("quantity", element.quantity);
            itemInvoice.set("invoice", result);
            itemInvoice.set("deleted", false);
  
            itemInvoice.save().then(itemS=>{
              element.icon = "checkbox";
              element.iconColor="secondary";
            })
            .catch(error=>{
              procesoCorrecto = false;
              this.toastMsj("Error guardando item: " + element.nameProduct);
            });
          });
  
          if(procesoCorrecto){
            if(esProforma)
              this.toastMsj("Proforma generada correctamente");  
            else
              this.toastMsj("Factura creada correctamente");  
              
            this.getProformas();
          }
        })
        .catch(error=>{  
          if(esProforma)      
            this.toastMsj("Error generando proforma: 1008");
          else            
            this.toastMsj("Factura generada correctamente");  
        });
      }
      else{
        if(esProforma)
          this.toastMsj("Agregue productos a la lista para generar proforma");
        else
          this.toastMsj("Agregue productos a la lista para generar factura");  
      }
    }
  }

  deleteProforma(item){
    const prompt = this.alertCtrl.create({
      title: 'Confirme eliminación',
      message: "¿Desea elminar la proforma de manera permanente?",
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          }
        },
        {
          text: 'Eliminar',
          handler: data => {
            let Proforma = Parse.Object.extend("Invoices");
            let query = new Parse.Query(Proforma);
            query.equalTo("objectId", item.id);
        
            query.find()
            .then(results=>{
              if(results.length > 0){
                results[0].set("deleted", true);
                results[0].save().then(resSave=>{
                  this.toastMsj("Proforma eliminada correctamente");
                  this.getProformas();
                }).catch(error=>{
                  this.toastMsj("Error eliminando proforma: 1003");
                });
              }
              else{
                this.toastMsj("Error eliminando proforma: 1001");
              }
            }).catch(error=>{
              this.toastMsj("Error eliminando proforma: 1002");
            });            
          }
        }
      ]
    });
    prompt.present();

  }

  createFacturaDesdeMenu(){
    if(this.itemsBill == null || this.itemsBill.length < 1)
      this.toastMsj("Agregue productos a la factura");
    else if(!this.proformaCargadaMenu){
      const modal = this.modalCtrl.create(BillDetailsPage, {'itemsBill':this.itemsBill});
      modal.onDidDismiss(data => {
        
      });
      modal.present();
    }
  }

  gotoCategoria(itemCat){
    this.title = itemCat.name, 
    this.subCat = true, 
    this.idCategoria = itemCat.id, 
    this.idCategoriaPadre = itemCat.idCategoriaPadre,
    this. nameCategoriaPadre = itemCat.name;

    this.getCategoriasChild();
  }

  gotoUp(){
    if(this.idCategoria != null){
      if(this.idCategoriaPadre == null){
        this.title = "Categorias", 
        this.subCat = false 
        this.idCategoria = null, 
        this.idCategoriaPadre = null,
        this. nameCategoriaPadre = null;
        this.getCategoriasChild();
      }
      else{        
        this.title = this.nameCategoriaPadre, 
        this.subCat = true, 
        this.idCategoria = this.idCategoria, 
        this.idCategoriaPadre = null,
        this. nameCategoriaPadre = null;
        this.getCategoriasChild();
      }
    }
  }

  /****************************/
  /*LOGICA USUARIOS */
  /****************************/

  getCustomers(){
    //this.presentLoading3("Obteniendo datos");
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
      //this.popLoading3.dismiss();
    })
    .catch(error=>{
      this.toastMsj("Error obteniendo datos");
      //this.popLoading3.dismiss();
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

  presentLoading2(msj) {
    const loader = this.loadingCtrl.create({
      content: msj
    });
    
    this.popLoading2 = loader;
    loader.present();
  }

  presentLoading3(msj) {
    const loader = this.loadingCtrl.create({
      content: msj
    });
    
    this.popLoading3 = loader;
    loader.present();
  }
}
