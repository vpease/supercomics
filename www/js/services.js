angular.module('services', ['db'])

.factory('Ads',function($q){
        var platform ="";
        var admobid = {};
        return {
            getPlat: function(){
                var dfd = $q.defer();
                //platform = $cordovaDevice.getPlatform();
                //console.log('El navegador es: '+navigator.userAgent);
                if( /(windows phone)/i.test(navigator.userAgent) ) { // Windows Phone
                    admobid = {
                        banner: 'ca-app-pub-8360727579286709/5823034677',
                        interstitial: 'ca-app-pub-8360727579286709/7299767879'
                    };
                    console.log('Admob para Windows Phone 8');
                } else if( /(android)/i.test(navigator.userAgent) ) { // for android
                    admobid = {
                        banner: 'ca-app-pub-8360727579286709/4765103872',
                        interstitial: 'ca-app-pub-8360727579286709/6241837074'
                    };
                    //console.log('Admob para Android');
                } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
                    admobid = {
                        banner: 'ca-app-pub-8360727579286709/4485902276',
                        interstitial: 'ca-app-pub-8360727579286709/5962635473'
                    };
                    console.log('Admob para iOS');
                } else {
                    admobid = {
                        banner: 'ca-app-pub-8360727579286709/5823034677',
                        interstitial: 'ca-app-pub-8360727579286709/7299767879'
                    };
                    console.log('Admob para el resto');
                }
                dfd.resolve(admobid);
                return dfd.promise;
            },
            getAdid: function(){
                return admobid;
            }
        }
    })
.factory('Cats', function($q,DB) {
        var cats = [
        { _id: 'cat1', tipo: 'catalogo', avatar: 'img/cats/avatar01.png', class:'cat01', name: 'Marvel', image:'img/cats/cat01.png', color: 'red'},
        { _id: 'cat2', tipo: 'catalogo', avatar: 'img/cats/avatar02.png', class:'cat02', name: 'DC',image:'img/cats/cat02.png', color: 'blue' },
        { _id: 'cat3', tipo: 'catalogo', avatar: 'img/cats/avatar03.png', class:'cat03', name: 'Image',image:'img/cats/cat03.png', color: 'yellow' },
        { _id: 'cat4', tipo: 'catalogo', avatar: 'img/cats/avatar04.png', class:'cat04', name: 'Dark Horse',image:'img/cats/cat04.png', color: 'cyan' },
        { _id: 'cat5', tipo: 'catalogo', avatar: 'img/cats/avatar05.png', class:'cat05', name: 'Peru21',image:'img/cats/cat05.png', color: 'white' },
        { _id: 'cat6', tipo: 'catalogo', avatar: 'img/cats/avatar06.png', class:'cat06', name: 'VUK',image:'img/cats/cat06.png', color: 'black' },
          { _id: 'cat7', tipo: 'catalogo', avatar: 'img/cats/avatar07.png', class:'cat07', name: 'Skecthboy',image:'img/cats/cat07.png', color: 'white' }
      ];
  return {
      copyLocal: function(key){
          var temp = self.getWithAttach(key);

      },
      data: function(){
          DB.init();
      },
      replicate: function() {
          DB.replicate();
      },
      getDB: function(key){
          var dfd = $q.defer();
          DB.get(key)
              .then(function(result){
                  console.log('Recuperando un documento');
                  dfd.resolve(result);
              },function(error){
              console.log('Error en get'+error);
          });
          return dfd.promise;
      },
      getCatalogos: function(){
          var dfd = $q.defer();
          DB.getAll({startkey: 'cat',endkey:'cat\uffff',include_docs:true})
              .then(function(result){
                  console.log('Recuperando catálogos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getCatalogos: '+error);
              });
          return dfd.promise;
      },
      getColecciones: function(catid){
          var dfd = $q.defer();
          DB.getView('comics/colecciones',{startkey:[catid,{}],endkey:[catid], include_docs:true,descending:true})
              .then(function(result){
                  console.log('Recuperando colecciones');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getColecciones:'+error);
              });
          return dfd.promise;
      },
      getUltimosFecha: function(salto,limite){
          var dfd =$q.defer();
          var fecha = new Date();
          var dia = (fecha.getDate().toString().length==2)?fecha.getDate():'0'+fecha.getDate();
          var mes = (fecha.getMonth().toString().length==2)?(fecha.getMonth()+1):'0'+(fecha.getMonth()+1);
          var anio= fecha.getFullYear();
          var fechapar = anio+'/'+mes+'/'+dia;

          DB.getView('comics/ultimos',{startkey:[fechapar,{}],skip:salto, limit:limite, descending:true,include_docs:true})
              .then(function(result){
                  console.log('Recuperando Ultimos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getUltimo:'+error);
              });
          return dfd.promise;
      },
      getUltimos: function(salto,limite){
          var dfd =$q.defer();
          DB.getView('comics/ultimos',{skip:salto, limit:limite, descending:true,include_docs:true})
              .then(function(result){
                  console.log('Recuperando Ultimos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getUltimo:'+error);
              });
          return dfd.promise;
      },
      getComs: function(colid){
          var dfd = $q.defer();
          stkey ='com_'+colid+'_';
          enkey = stkey+'\uffff';
          DB.getAll({startkey:stkey,endkey:enkey,include_docs:true})
              .then(function(result){
                  console.log('Recuperando comics');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getComs'+error);
              });
          return dfd.promise;
      },
      getBarcode: function(barcode){
          var dfd =$q.defer();
          DB.getView('comics/barcode',{startkey:[barcode],endkey:[barcode,{}],descending:true,group:true})
              .then(function(result){
                  console.log('Recuperando Barcode');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en Barcode:'+error);
              });
          return dfd.promise;
      },
      getAttach: function(key,attach){
          var dfd = $q.defer();
          DB.getAttach(key,attach)
              .then(function(result){
                  //console.log('Cargar blob');
                  url = window. URL || window.webkitURL;
                  res = url.createObjectURL(result);
                  dfd.resolve(res);
              },function(error){
                  console.log('Error cargando blob:' + error);
              });
          return dfd.promise;
      },
      put: function(object){
          DB.put(object);
      },
      all: function() {
          var dfd = $q.defer();
          res = cats;
          dfd.resolve(res);
          return dfd.promise;
      },
      get: function(catId) {
          var dfd = $q.defer();
          angular.forEach(cats,function(cat){
              if (cat._id == catId){
                  res = cat;
              }
          });
          dfd.resolve(res);
          return dfd.promise;
      }
  }
});
