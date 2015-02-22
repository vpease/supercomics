/**
 * Created by vpease on 20/12/2014.
 */
angular.module('db',[])

.factory('DB',function($q,$rootScope) {
        var self = this;
        self.db;
        self.init = function() {
            if (!self.db) {
                console.log('database is closed');

                //console.log('voy a cargar el plugin');
                //PouchDB.plugin("pouchdb-load");
                //console.log('ya cargué el plugin');

                self.db = new PouchDB('supercomics',{
                    adapter: 'websql',
                    size: 50,
                    auto_compaction:true});
                if (!self.db.adapter){
                    self.db  = new PouchDB('supercomics');
                    console.log('Usando IndexedDB');
                } else {
                    console.log('Usando websql');
                }

                self.initial();

                console.log('ya se grabó');
            }
        };
        self.initial = function(){
            console.log('Entrando a la carga inicial');
            initial = localStorage['initial']||'false';
            if (initial){
                console.log('Entrando a la carga de data.txt');
                var dumpFiles = ['data.txt'];
                PouchDB.utils.Promise.all(dumpFiles.map(function (dumpFile) {
                    console.log('A punto de iniciar la carga de data.txt');
                    return self.db.load('/data/' + dumpFile);
                })).then(function () {
                    console.log('Carga correcta');
                    localStorage['initial']='true';
                    $rootScope.$broadcast('dbinit:uptodate');
                }).catch(function (err) {
                    console.log('Error en la carga'+err);
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
            });

        };
        self.replicate = function(){
            var sync = self.db.replicate.from(
                'http://192.168.1.100:5984/supercomics',
                {live:true, retry:true})
                .on('paused',function(info){
                    console.log('Estoy en el estado paused');
                    $rootScope.$broadcast('db:uptodate');
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