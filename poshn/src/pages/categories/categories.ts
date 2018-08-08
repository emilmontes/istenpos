import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';


/**
 * Generated class for the CategoriesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

import Parse from 'parse';

@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  title:string;
  categories: Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string }>
  subCat = false;
  nameCategoria:string;
  idCategoria:any;
  nameCategoriaPadre:string;
  idCategoriaPadre:any;
  childExists = false;
  popLoading:any;
  images:Array<{image:string}> = [{image:"assets/imgs/food_blue.png"},
                                  {image:"assets/imgs/food_orange.png"},
                                  {image:"assets/imgs/food_red.png"},
                                  {image:"assets/imgs/food_green2.png"}];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              public toastCtrl: ToastController,
              public loadingCtrl: LoadingController,
              public menuCtrl: MenuController) {
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
    this.getCategoriasChild();
  }

  back(){
    this.navCtrl.pop();
  }

  getCategoriasChild(){
    this.presentLoading("Cargando datos");
    console.log("idSubcategoria: " + this.idCategoria);
    if(!this.subCat){
      this.categories = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:string}>();
      let Categoria = Parse.Object.extend("Categories");
      let queryCat = new Parse.Query(Categoria);
      queryCat.equalTo("parent", null);
      queryCat.equalTo("deleted", false);

      queryCat.find()
      .then(results=>{        
        //console.log("categorias en base: " + results.length);
        results.forEach(element => {
          this.categories.push({id:element.id, name:element.get("name"), idCategoriaPadre:null, nameCategoriaPadre: "Categoria principal", image:null});

          if(this.categories.length > 0)
            this.childExists = true;
          else{
            this.childExists = false;
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
            //console.log("imagen de categoria: " + element.image);
          });
        });
        this.popLoading.dismiss();
      }).catch(error=>{
        this.toastMsj("Error obteniendo categorias");
        this.childExists = false;
        this.popLoading.dismiss();
      });
    }
    else{
      //this.menuCtrl.enable(false, "myMenu");
      this.categories = Array<{id:any, name:string, idCategoriaPadre:any, nameCategoriaPadre:string, image:null}>();

      let Categoria = Parse.Object.extend("Categories");
      let queryCat = new Parse.Query(Categoria);
      queryCat.equalTo("objectId", this.idCategoria);
 
      queryCat.find()
      .then(results=>{
        if(results.length > 0){
          let querySubCategories = new Parse.Query(Categoria);
          querySubCategories.equalTo("parent", results[0]);
          querySubCategories.equalTo("deleted", false);

          querySubCategories.find()
          .then(subCats =>{
            //console.log("subcategorias: " + subCats.length);
            subCats.forEach(element => {
              this.categories.push({id:element.id, name:element.get("name"), idCategoriaPadre:this.idCategoria, nameCategoriaPadre: results[0].get("name"),image:null});
            });
            this.popLoading.dismiss();

            if(this.categories.length > 0)
              this.childExists = true;
            else{
              this.childExists = false;
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

              console.log("imagen de categoria: " + element.image);
            });
          }).catch(error=>{            
            this.toastMsj("Error buscando subcategorias");
            this.popLoading.dismiss();
            this.navCtrl.pop();
          });
        }
        else{
          this.popLoading.dismiss();
          this.toastMsj("Error buscando categoria: 1001");
          this.navCtrl.pop();
        }
      }).catch(error=>{
        this.toastMsj("Error buscando categoria: 1002");
        this.popLoading.dismiss();
        this.navCtrl.pop();
      });
    }
  }

  addCategory(){
    if(this.idCategoriaPadre==null){
      const prompt = this.alertCtrl.create({
        title: 'Agregar Categoria',
        message: "Ingrese el nombre de la nueva categoria",
        inputs: [
          {
            name: 'name',
            placeholder: 'Nombre de categoria'
          },
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
              if(!this.subCat){
                let Categories = Parse.Object.extend("Categories");
                let categoria = new Categories();
                categoria.set("name", data.name);
                categoria.set("parent", null);
                categoria.set("deleted", false);
  
                categoria.save()
                .then(result =>{ 
                  this.popLoading.dismiss();
                  this.toastMsj("Categoria agregada correctamente");
                  this.getCategoriasChild();
                }).catch(error => {
                  this.toastMsj("Error agregando nueva categoria");
                  this.popLoading.dismiss();
                });
              }
              else{
                let Categoria = Parse.Object.extend("Categories");
                let queryCat = new Parse.Query(Categoria);
                queryCat.equalTo("objectId", this.idCategoria);

                queryCat.find()
                .then(results=>{
                  if(results.length > 0){
                    let Categories = Parse.Object.extend("Categories");
                    let categoria = new Categories();
                    categoria.set("name", data.name);
                    categoria.set("parent", results[0]);
                    categoria.set("deleted", false);
      
                    categoria.save()
                    .then(result =>{ 
                      this.popLoading.dismiss();
                      this.toastMsj("Categoria agregada correctamente");
                      this.getCategoriasChild();
                    }).catch(error => {
                      this.toastMsj("Error agregando nueva categoria");
                      this.popLoading.dismiss();
                    });
                  }
                  else{
                    this.popLoading.dismiss();
                    this.toastMsj("Error buscando categoria: 1001");
                    return false;
                  }
                }).catch(error=>{
                  this.toastMsj("Error buscando categoria: 1002");
                  this.popLoading.dismiss();
                  return false;
                });
              }
            }
          }
        ]
      });
      prompt.present();
    }
    else{
      const prompt = this.alertCtrl.create({
        title: 'Agregar Categoria',
        message: "Ingrese el nombre de la nueva categoria<hr />\n<b>Categoria padre:</b> " + this.nameCategoria,
        inputs: [
          {
            name: 'name',
            placeholder: 'Nombre de categoria'
          },
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
              let Categories = Parse.Object.extend("Categories");

              let queryCategories = new Parse.Query(Categories);
              queryCategories.equalTo("objectId", this.idCategoria);

              queryCategories.find().then(results =>{
                if(results.length > 0){
                  let categoria = new Categories();
                  categoria.set("name", data.name);
                  categoria.set("parent", results[0]);
                  categoria.set("deleted", false);
    
                  categoria.save()
                  .then(result =>{ 
                    this.popLoading.dismiss();
                    this.toastMsj("Categoria agregada correctamente");
                    this.getCategoriasChild();
                  }).catch(error => {
                    this.toastMsj("Error agregando nueva categoria: 1001");
                    this.popLoading.dismiss();
                    return false;
                  });
                }
                else{
                  this.toastMsj("Error agregando nueva categoria:1002");
                  this.popLoading.dismiss();
                  return false;
                }
                
              }).catch(error=>{
                this.toastMsj("Error agregando nueva categoria:1003");
                this.popLoading.dismiss();
                return false;
              });
            }
          }
        ]
      });
      prompt.present();
    }
  }

  confirmDelete(item){
      const prompt = this.alertCtrl.create({
        title: '<b color="danger">Confirme eliminación</b>',
        message: "¿Desea eliminar la categoria <b>"+ item.name +"</b> de manera permanente?",
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
              let Categories = Parse.Object.extend("Categories");
              let query = new Parse.Query(Categories);
              query.equalTo("objectId", item.id);

              query.find()
              .then(results =>{ 
                if(results.length > 0){
                  results[0].set("deleted", true);

                  results[0].save()
                  .then(result=>{
                    this.popLoading.dismiss();
                    this.toastMsj("Categoria eliminada correctamente");
                    this.getCategoriasChild();
                  })
                  .catch(error=>{       
                    this.popLoading.dismiss();             
                    this.toastMsj("Error eliminando categoria: 1003");
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
    const prompt = this.alertCtrl.create({
      title: 'Confirme eliminación',
      message: "Edición de categoria <b>" + item.name + "</b>",
      inputs: [
        {
          name: 'name',
          placeholder: item.name
        },
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
            if(data.name.length > 0){
              this.presentLoading("Guardando");
              let Categories = Parse.Object.extend("Categories");
              let query = new Parse.Query(Categories);
              query.equalTo("objectId", item.id);

              query.find()
              .then(results =>{ 
                if(results.length > 0){
                  results[0].set("name", data.name);

                  results[0].save()
                  .then(result=>{
                    this.popLoading.dismiss();
                    this.toastMsj("Categoria actualizada correctamente");
                    this.getCategoriasChild();
                  })
                  .catch(error=>{       
                    this.popLoading.dismiss();             
                    this.toastMsj("Error actualizando categoria: 1003");
                    return false;
                  });
                }
                else{
                  this.popLoading.dismiss();
                  this.toastMsj("Error actualizando categoria: 1002");
                  return false;
                }
              }).catch(error => {
                this.toastMsj("Error actualizando categoria: 1001");
                this.popLoading.dismiss();
                return false;
              });
            }
            else{
              this.toastMsj("Ingrese un nombre para la categoria");
              this.popLoading.dismiss();
              return false;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  gotoCategoria(itemCat){
    this.navCtrl.push(CategoriesPage, {title:itemCat.name, 
                                        subcat:true, 
                                        idCategoria:itemCat.id, 
                                        idCategoriaPadre:itemCat.idCategoriaPadre,
                                        nameCategoriaPadre:itemCat.nameCategoriaPadre});
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
