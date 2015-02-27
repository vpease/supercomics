angular.module('controllers', ['ngCordova'])
    .controller('LoginCtrl',function($scope,Cats,Ads,$cordovaGoogleAnalytics){
        //Cats.data();
        $cordovaGoogleAnalytics.trackView('login');
    })
    .controller('DashCtrl', function($scope,$location,$rootScope,$ionicTabsDelegate,Cats,comics,$cordovaGoogleAnalytics) {
        $cordovaGoogleAnalytics.trackView('dash');
        $scope.comics = comics.rows;
        $scope.setLink = function(pCat,pCol,pCom){
            url = "/tab/comic/"+pCat+"/"+pCol+"/"+pCom;
            $ionicTabsDelegate.select(1);
            $location.path(url);
            $rootScope.$apply;
        };
        getCover = function(){
            angular.forEach($scope.comics,function(comic){
                Cats.getAttach(comic.id,comic.key[5])
                    .then (function (result){
                        comic.key[5] = result;
                        //console.log(result);
                    }, function (error){
                    console.log('Error en el blob:'+ eror);
                });
                    console.log('cover del comic cargado');
                Cats.getAttach(comic.doc._id,Object.keys(comic.doc._attachments)[0])
                    .then (function (result){
                        comic.doc.tipo = result;
                        //console.log(result);
                        //console.log('cover del comic cargado');
                        
                        },function (error){
                          console.log('problemas con el cover del comic')
                    });
                });
            };
        getCover();

    })
    .controller('CatsCtrl', function($scope,$ionicSlideBoxDelegate, cats,$cordovaGoogleAnalytics) {
        $cordovaGoogleAnalytics.trackView('cats');
        $scope.$on('$ionicView.enter',function(){
            console.log('Updating slidebox');
            $ionicSlideBoxDelegate.update();
        });
        $scope.cats = cats.rows;
        $scope.navSlide = function(index){
            $ionicSlideBoxDelegate.slide(index,500);
            console.log("Slided:  "+index);
        };
        $scope.navChanged = function(index){
            console.log("Changed: "+index);
        }
    })
    .controller('CatDetailCtrl', function($scope,cat,cols,Cats,$cordovaGoogleAnalytics) {
        $cordovaGoogleAnalytics.trackView('CatDetail');
        $scope.cat = cat;
        $scope.cols = cols.rows;
        $scope.token="";
		$scope.sortToken = '-doc.published';
        getCover = function(){
            angular.forEach($scope.cols,function(col){
                Cats.getAttach(col.doc._id,Object.keys(col.doc._attachments)[0])
                    .then (function (result){
                    col.doc.tipo = result;
                    //console.log(result);
                    //};
                    //console.log('cover del comic cargado');
                },function (error){
                    //console.log('problemas con el cover del comic')
                });
            });
        };
        getCover();
    })
    .controller('CatDetailComicsCtrl',function($scope,cat,col,comics,Cats,$cordovaGoogleAnalytics){
        $cordovaGoogleAnalytics.trackView('CatDetailComics');
        $scope.cat= cat;
        $scope.col = col;
        $scope.comics = comics.rows;
        $scope.token="";
        $scope.sortToken = 'doc.published';
        $scope.getItemHeight = function(item,index){
            return (index %2)=== 0 ? 50:60;
        };
        getCover = function(){
            Cats.getAttach(col._id,Object.keys(col._attachments)[0])
                .then (function (result){
                col.tipo = result;
                //console.log(result);
                //};
                console.log('cover del comic cargado');
            },function (error){
                console.log('problemas con el cover del comic')
            });
            angular.forEach($scope.comics,function(comic){
                Cats.getAttach(comic.id,Object.keys(comic.doc._attachments)[0])
                    .then (function (result){
                    comic.doc.tipo = result;
                    //console.log(result);
                }, function (error){
                    console.log('Error en el blob:'+ eror);
                });
                console.log('cover del comic cargado');
            });
        };
        getCover();
    })
    .controller('CatDetailComicCtrl',function($scope,$state,cat,col,comic,Cats,$cordovaGoogleAnalytics){
        $cordovaGoogleAnalytics.trackView('CatDetailComic');
        $scope.cat= cat;
        $scope.col = col;
        $scope.comic = comic;
        getCover = function(){
            Cats.getAttach(col._id,Object.keys(col._attachments)[0])
                .then (function (result){
                col.tipo = result;
                //console.log(result);
                //};
                //console.log('cover del comic cargado');
            },function (error){
                console.log('problemas con el cover del comic')
            });
            Cats.getAttach(comic._id,Object.keys(comic._attachments)[0])
                .then (function (result){
                comic.tipo = result;
                //console.log(result);
                //console.log('cover del comic cargado');
            },function (error){
                console.log('problemas con el cover del comic')
            });
        };
        getCover();
    })
    .controller('BuscarCtrl',function($scope,$state,$cordovaBarcodeScanner){
        $scope.getBarcode = function(){
            $cordovaBarcodeScanner.scan().then(function(barcodeData){
                alert (barcodeData.text)
                $state.go('tab.buscar.result',{barcode:barcodeData.text});
            },function(error){
                //alert ('Error:'+error);
                $state.go('tab.buscar.result',{barcode:''});
            });
        };
        $scope.buscar = function(barcode){
            $state.go('tab.buscar.result',{barcode:barcode});
        };
    })
    .controller('BuscarResCtrl',function($scope,res){
        $scope.res = res;
        alert (res);
    })
    .controller('AccountCtrl', function($scope) {

    });
