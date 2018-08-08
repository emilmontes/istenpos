import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import Parse from 'parse'
import { query } from '../../../node_modules/@angular/core/src/render3/instructions';
import { ThrowStmt } from '../../../node_modules/@angular/compiler';

/**
 * Generated class for the AdminProductsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-admin-products',
  templateUrl: 'admin-products.html',
})
export class AdminProductsPage {
  popLoading:any;
  categories: Array<{name:any, value:any}>;
  categorieId:any;
  categoryObject:any;
  childExists:boolean;
  productsCategory: Array<{id:any, name:string, price:number}>;

  selectedOptionCategories= {
    title: 'Categorias',
    subTitle: 'Seleccione una categoria',
    mode: 'md'
  };

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminProductsPage');
    this.categories = Array<{name:any, value:any}>();
    let Categories = Parse.Object.extend("Categories");
    let queryGetCategories = new Parse.Query(Categories);
    queryGetCategories.equalTo("deleted", false);

    queryGetCategories.find()
    .then(results=>{
      console.log("se obtienen categorias");
      results.forEach(element => {
        console.log("categoria: " + element.get("name"));
        console.log("idCategoria: " + element.id);

        this.categories.push({name:element.get("name"), value:element.id});
      });
    }).catch(error=>{
      this.toastMsj("Error obteniendo categorias");
    });

  }

  getItemsCategorie(){
    let Categoria = Parse.Object.extend("Categories");
    let findCategory = new Parse.Query(Categoria);
    findCategory.equalTo("objectId", this.categorieId);
    this.productsCategory = Array<{id:any, name:string, price:number}>();

    findCategory.find()
    .then(results=>{
      if(results.length > 0){
        this.categoryObject = results[0];
        let Producto = Parse.Object.extend("Products");
        let query = new Parse.Query(Producto);
    
        query.equalTo("category", results[0]);

        query.find()
        .then(products=>{
          products.forEach(element => {
            this.productsCategory.push({id:element.id, name:element.get("name"), price:element.get("price")});
          });

          if(this.productsCategory.length < 1){
            this.toastMsj("Sin productos en categoria seleccionada");
            this.childExists = false;
          }
          else
            this.childExists = true;

        }).catch(errorP=>{
          this.toastMsj("Error obteniendo productos");
          this.categoryObject = null;
          this.categorieId = null;
          this.childExists = false;
        });
      }
      else{
        this.toastMsj("Error obteniendo categoria seleccionada:  1001");
        this.categoryObject = null;
        this.categorieId = null;
        this.childExists = false;
      }
    })
    .catch(error=>{
      this.toastMsj("Error obteniendo categoria seleccionada:  1002");
      this.categoryObject = null;
      this.categorieId = null;
      this.childExists = false;
    });

  }

  addProduct(){
    if(this.categorieId != null){
      const prompt = this.alertCtrl.create({
        title: 'Agregar producto a ' + this.categoryObject.get("name"),
        message: "Datos de producto:",
        inputs: [
          {
            name: 'name',
            placeholder: 'Nombre de producto'
          },
          {
            name: 'price',
            placeholder: 'Precio lempiras',
            type:'number'
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
              if(data.name.length < 1 || data.price.length < 1)
                this.toastMsj("Ingrese nombre y precio del producto");
              else{
                this.presentLoading("Guardando");
                
                let Products = Parse.Object.extend("Products");
                let producto = new Products();
                producto.set("name", data.name);
                producto.set("price", data.price);
                producto.set("category", this.categoryObject);
  
                producto.save()
                .then(result =>{ 
                  this.popLoading.dismiss();
                  this.toastMsj("Producto agregado correctamente");
                  this.getItemsCategorie();
                }).catch(error => {
                  this.toastMsj("Error agregando nuevo producto");
                  this.popLoading.dismiss();
                });
              }
            }
          }
        ]
      });
      prompt.present();
    }
    else
      this.toastMsj("Seleccione una categoria");
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
