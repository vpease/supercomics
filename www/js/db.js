/**
 * Created by vpease on 20/12/2014.
 */
angular.module('db',['ngCordova'])

.factory('DB',function($q,$rootScope,$cordovaFile) {
        var self = this;
        self.db;
        self.remoteserver = 'http://andentleationsteathediti:OEpyUVQK75oJdQV3MmlrxpPl@vpease.cloudant.com/supercomics';
        self.init = function() {
            if (!self.db) {
                console.log('database is closed');

                //console.log('voy a cargar el plugin');
                //PouchDB.plugin("pouchdb-load");
                //console.log('ya cargué el plugin');

                self.db = new window.PouchDB('supercomics',{
                    adapter: 'websql',
                    size: 10,
                    auto_compaction:true});
                if (!self.db.adapter){
                    self.db  = new window.PouchDB('supercomics');
                    console.log('Usando IndexedDB');
                } else {
                    console.log('Usando websql');
                }

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

            /*console.log('Entrando a la carga inicial');
            initial = window.localStorage['initial']||'false';
            if (initial){
                console.log('Entrando a la carga de data.txt');
                var dumpFiles = ['data_00000000.txt','data_00000001.txt','data_00000002.txt','data_00000003.txt',
                    'data_00000004.txt','data_00000011.txt','data_00000017.txt','data_00000023.txt','data_00000029.txt',
                    'data_00000005.txt','data_00000012.txt','data_00000018.txt','data_00000024.txt','data_00000030.txt',
                    'data_00000006.txt','data_00000013.txt','data_00000019.txt','data_00000025.txt','data_00000031.txt',
                    'data_00000007.txt','data_00000014.txt','data_00000020.txt','data_00000026.txt','data_00000032.txt',
                    'data_00000008.txt','data_00000015.txt','data_00000021.txt','data_00000027.txt','data_00000033.txt',
                    'data_00000009.txt','data_00000016.txt','data_00000022.txt','data_00000028.txt','data_00000034.txt',
                    'data_00000035.txt','data_00000036.txt','data_00000037.txt','data_00000038.txt','data_00000039.txt',
                    'data_00000040.txt','data_00000041.txt','data_00000042.txt','data_00000043.txt','data_00000044.txt',
                    'data_00000045.txt','data_00000046.txt','data_00000047.txt','data_00000048.txt','data_00000049.txt',
                    'data_00000050.txt'];
                PouchDB.utils.Promise.all(dumpFiles.map(function (dumpFile) {
                    console.log('A punto de iniciar la carga de data.txt');
                    return self.db.load('data/' + dumpFile,
                        { proxy: self.remoteserver, ajax:{cache:true}});
                })).then(function () {
                    console.log('Carga correcta');
                    window.localStorage['initial']='true';
                    $rootScope.$broadcast('dbinit:uptodate');
                }).catch(function (err) {
                    console.log('Error en la carga'+err);
                    window.localStorage['initial']='true';
                    $rootScope.$broadcast('dbinit:uptodate');
                });
            } else {
                console.log('Carga inicial no necesaria');
                $rootScope.$broadcast('dbinit:uptodate');
            }
            self.db.compact().then(function(info){
                console.log('DB compactada: ' +info);
            }).catch(function(err){
                console.log('Error mientras compactando: '+ err);
            });*/

        };
        self.replicate = function(){
            var sync = self.db.replicate.from(
                self.remoteserver,
                {live:true, retry:true})
                .on('paused',function(info){
                    console.log('Estoy en el estado paused');
                    //$rootScope.$broadcast('db:uptodate');
                })
                .on('change',function(info){
                    console.log('Cambios en la base de datos'+info);
                }).on('complete',function(info){
                    console.log('Sync data complete'+info);
                }).on('uptodate',function(info){
                    console.log('Actualizado datos'+info);
                    $rootScope.$broadcast('db:uptodate');
                }).on('error',function(err){
                    console.log('Error en sync datos: '+err);
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