/**
 * Created by vpease on 20/12/2014.
 */
angular.module('db',['ngCordova'])

.factory('DB',function($q,$rootScope) {
        var self = this;
        self.db;
        self.remoteserver = 'http://andentleationsteathediti:OEpyUVQK75oJdQV3MmlrxpPl@supercomics.supermio.com/supercomics';
        self.init = function() {
            if (!self.db) {
                console.log('database is closed');

                self.db = new window.PouchDB('supercomics',{
                    adapter: 'websql',
                    size: 50,
                    auto_compaction:true});
                if (!self.db.adapter){
                    self.db  = new window.PouchDB('supercomics');
                    console.log('Usando IndexedDB');
                } else {
                    console.log('Usando websql');
                }
                //PouchDB.debug.enable('*');
                self.initial();
                console.log('ya se grabó');
            }
        };
        self.initial = function(){
            window.localStorage['cargando']="false";

            self.db.get('_local/initial_load_complete').catch(function(err){
               if (err.status !== 404){
                   throw err;
               }
                console.log('Entrando a la carga de data.txt');
                var dumpFiles = ['data.txt'];
                PouchDB.utils.Promise.all(dumpFiles.map(function (dumpFile) {
                    console.log('A punto de iniciar la carga de data.txt');
                    window.localStorage['cargando']="true";
                    return self.db.load('data/' + dumpFile,
                        { proxy: self.remoteserver, ajax:{cache:true}});
                })).then(function () {
                    console.log('Carga correcta');
                    window.localStorage['cargando']="false";
                    self.db.put({_id: '_local/initial_load_complete'});
                    $rootScope.$broadcast('dbinit:uptodate');
                    return;
                }).catch(function (err) {
                    console.log('Error en la carga'+err);
                    $rootScope.$broadcast('dbinit:uptodate');
                });
            }).then(function(){
                if (window.localStorage['cargando']!=="true"){
                    console.log('La carga no fue necesaria');
                    $rootScope.$broadcast('dbinit:uptodate');
                }
            }).catch(function(err){
                console.log('Este es un error inesperado '+err);
            });
        };
        self.replicate = function(){
            var sync = self.db.replicate.from(
                self.remoteserver,
                {live:false, retry:true})
                .on('paused',function(info){
                    console.log('Estoy en el estado paused');
                    //$rootScope.$broadcast('db:uptodate');
                })
                .on('change',function(info){
                    console.log('Cambios en la base de datos'+JSON.stringify(info));
                }).on('complete',function(info){
                    var timeout = 600000;
                    console.log('Sync data complete'+JSON.stringify(info));
                    if (info.docs_written>0) timeout=6000000;
                    setTimeout(function(){
                        console.log('sync nuevamente');
                        self.replicate();
                    },timeout);
                    $rootScope.$broadcast('db:uptodate');
                }).on('uptodate',function(info){
                    console.log('Actualizado datos'+JSON.stringify(info));
                    //$rootScope.$broadcast('db:uptodate');
                }).on('error',function(err){
                    console.log('Error en sync datos: '+JSON.stringify(err));
                })
        };
        self.getView = function(view,options){
            return self.db.query(view,options);
        };
        self.getAll = function(query){
          return self.db.allDocs(query);
        };
        self.remove = function (key){
          self.db.remove(key,function(err,response){
              if (err){
                  console.log(err);
              } else {
                  console.log(response);
              }
          });
        };
        self.get = function(key){
            return self.db.get(key);
        };
        self.getAttach = function(key,attach){
            return self.db.getAttachment(key,attach);
        };
        self.put = function(object){
            if (!self.db){
                self.init();
            }
            self.db.get(object._id,function(err,doc){
                if (!err){
                    if (doc){
                        object._rev = doc._rev;
                        doc = object;
                        self.db.put(doc).then(function(response){
                            console.log('Update Ok');
                        }).catch(function(error){
                            console.log('Error en Update:'+error.toString());
                        });
                    } else {
                        self.db.put(object).then(function(response){
                            console.log('Insert Ok');
                        }).catch(function(error){
                            console.log('Error al insertar: '+error.toString());
                        });
                    }
                } else {
                    if (err.status==404){
                        self.db.put(object).then(function(response){
                            console.log('Insert Ok');
                        }).catch(function(error){
                            console.log('Error al insertar: '+error.toString());
                        });
                    } else {
                        console.log("Error: "+err);
                    }
                }
            });
        };
        self.bulk = function(objects){
            if (!self.db){
                self.init();
            };
            self.db.bulkDocs(objects,{new_edits:true},function(err,response){
                if (!err){
                    console.log('Todo ok con el bulk: '+response.toString());
                } else {
                    console.log('Error:'+ err.toString());
                }
            });
        }
    return self;
})