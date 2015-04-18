angular.module('comics', ['ionic', 'controllers', 'services','ngCordova','Super'])
    .run(function($ionicPlatform,Ads,Cats,Super,$cordovaGoogleAnalytics,$cordovaDevice) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            console.log("App is ready!!");
            window.localStorage['cordovaready'] = 'true';
            Super.set();
            var deviceId = '';
            try {
                deviceId = $cordovaDevice.getUUID();
            } catch (e) {
                deviceId = 'browser';
            }
            window.localStorage['deviceId'] = deviceId;
            if (Super.getMobile()) {
                //console.log('Antes de entrar al Ad section: ' + $cordovaDevice.getVersion());
                //console.log('La validación es: ' + $cordovaDevice.getVersion() >= "4.2");
                version = $cordovaDevice.getVersion().split(".");
                if (($cordovaDevice.getPlatform().toUpperCase().indexOf("WIN") != 0) || ((version[0] >= "4")) && (version[1] > "1")) {
                    Ads.getPlat().then(function (result) {
                        if (result) {
                            //console.log('Se ha recuperado la plataforma:' + JSON.stringify(result));
                            //console.log('La variable admob: '+JSON.stringify(AdMob));
                            Ads.getPlat().then(function (result) {
                                if (result) {
                                    var options = {
                                        publisherID: result.banner,
                                        adSize: 'SMART_BANNER',
                                        bannerAtTop: true, // Set to true, to put banner at top
                                        overlap: false, // True to allow banner overlap webview
                                        offsetTopBar: true, // True to avoid ios7 status bar overlap
                                        isTesting: false, // receiving test to
                                        Autoshow: true
                                    };
                                    if (AdMob) {
                                        if ($cordovaDevice.getPlatform().toUpperCase().indexOf("WIN") != 0) {
                                            AdMob.createBanner({
                                                adId: result.banner,
                                                adSize: AdMob.SMART_BANNER,
                                                position: AdMob.AD_POSITION.TOP_CENTER,
                                                autoShow: true,
                                                isTesting: false,
                                                overlap: false
                                            });

                                            AdMob.prepareInterstitial({
                                                adId: result.interstitial,
                                                isTesting: false,
                                                autoShow: true
                                            });
                                            AdMob.showInterstitial();
                                        }
                                    }
                                }
                            }, function (error) {
                                console.log('Error recuperando plataforma:' + error);
                            });
                            //$cordovaGoogleAnalytics.debugMode();
                            $cordovaGoogleAnalytics.startTrackerWithId('UA-58872977-5');
                        }
                    })
                }
            }
            console.log('Iniciar datos');
            Cats.data();
        })
    })
    .run(function($rootScope,$location,Cats){
        $rootScope.$on('dbinit:uptodate',function(){
            ready = window.localStorage['cordovaready']||'false';
            console.log('Terminó la syncronizacion de diseño y ahora cordova es:'+ ready);
            while (ready=='false') {
                ready = window.localStorage['cordovaready']||'false';
                       console.log('Esperando a Cordova!!');
            }
            $location.path('/tab/cats');
            $rootScope.$apply();
            Cats.replicate();
        });
         $rootScope.$on('db:uptodate',function(){
             console.log('Terminó la syncronizacion de datos');
             $location.path('/tab/dash');
             console.log('Voy al dash');
             $rootScope.$apply();
         });
    })
	.config(function($ionicConfigProvider) {
		$ionicConfigProvider.backButton.text('Reg').icon('ion-chevron-left');
		$ionicConfigProvider.navBar.alignTitle("center"); //Places them at the bottom for all OS
		$ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
		$ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS

		})
    .config(function($stateProvider, $urlRouterProvider,$compileProvider) {

      $compileProvider.imgSrcSanitizationWhitelist('.*');
      //$compileProvider.imgSrcSanitizationWhitelist('img/*');
      //$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider
          .state('loading',{
              url:"/app",
              templateUrl: "templates/login.html",
              controller: "LoginCtrl",
              onEnter: function(){
                  console.log('Estoy en el estado login');
              },
              onExit: function(){
                  console.log('Saliendo del estado login')
              }
          })
          .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
            onEnter: function(){
              console.log('Estoy en el estado tab');
            },
            onExit: function(){
              console.log('Saliendo del estado tab')
            }
          })
          .state('tab.dash', {
            url: '/dash',
            views: {
              'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
              }
            },
            resolve:{
              comics:function(Cats){
                res = Cats.getUltimosFecha(0,20);
                return res;
              }
            },
            onEnter: function($ionicHistory){
                console.log('Estoy en el estado tab.dash');
                $ionicHistory.clearHistory();
            },
            onExit: function(){
              console.log('Saliendo del estado tab.dash')
            }
          })
          .state('tab.cats', {
            url: '/cats',
            views: {
              'tab-cats': {
                templateUrl: 'templates/tab-cats.html',
                controller: 'CatsCtrl'
              }
            },
            resolve: {
              cats: function(Cats){
                res = Cats.getCatalogos();
                return res;
              }
            },
            onEnter: function(){
              console.log('Estoy en el estado tab.cats');
            },
            onExit: function(){
              console.log('Saliendo del estado tab.cats')
            }
          })
          .state('tab.cat-detail', {
            url: '/cat/:catId',
            views: {
              'tab-cats': {
                templateUrl: 'templates/cat-detail.html',
                controller: 'CatDetailCtrl'
              }
            },
            resolve: {
              cat: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.catId);
                return res;
              },
              cols: function(Cats,$stateParams){
                res = Cats.getColecciones($stateParams.catId);
                return res;
              }
            },
            onEnter: function(){
              console.log('Estoy en el estado tab.cat-detail');
            },
            onExit: function(){
              console.log('Saliendo del estado tab.cat-detail')
            }
          })
          .state('tab.comics',{
            url: '/comics/:catId/:colId',
            views:{
              'tab-cats':{
                templateUrl: 'templates/cat-comics.html',
                controller: 'CatDetailComicsCtrl'
              }
            },
            resolve: {
              comics: function(Cats,$stateParams){
                res = Cats.getComs($stateParams.colId);
                return res;
              },
              cat: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.catId);
                return res;
              },
              col: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.colId);
                return res;
              }
            },
            onEnter: function(){
              console.log('Estoy en el estado tab.comics');
            },
            onExit: function(){
              console.log('Saliendo del estado tab.comics')
            }
          })
          .state('tab.comic',{
            url: '/comic/:catId/:colId/:comicId',
            views:{
              'tab-cats':{
                templateUrl: 'templates/cat-comic.html',
                controller: 'CatDetailComicCtrl'
              }
            },
            resolve: {
              comic: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.comicId);
                return res;
              },
              cat: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.catId);
                return res;
              },
              col: function(Cats,$stateParams){
                res = Cats.getDB($stateParams.colId);
                return res;
              }
            },
            onEnter: function($ionicTabsDelegate){
              console.log('Estoy en el estado tab.comic');

            },
            onExit: function(){
              console.log('Saliendo del estado tab.comic')
            }
          })
          .state('tab.buscar', {
            url: '/buscar',
            views: {
              'tab-buscar': {
                templateUrl: 'templates/tab-buscar.html',
                controller: 'BuscarCtrl'
              }
            },
            onEnter: function(){
              console.log('Estoy en el estado tab.buscar');
            },
            onExit: function(){
              console.log('Saliendo del estado tab.buscar')
            }
          })
          .state('tab.buscar.result',{
              url: '/:barcode',
              views: {
                  'tab-buscar': {
                      templateUrl: 'templates/buscar-res.html',
                      controller: 'BuscarResCtrl'
                  }
              },
              resolve: {
                  cols: function(Cats,$stateParams){
                      res = Cats.getBarcode($stateParams.barcode);
                      return res;
                  }
              },
              onEnter: function(){
                  console.log('Entrando al estado Buscar.result');
              },
              onExit: function(){
                  console.log('Saliendo del estado Buscar.result');
              }
          })
          .state('tab.account', {
            url: '/account',
            views: {
              'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
              }
            },
            onEnter: function(){
              console.log('Estoy en el estado tab.account');
            },
            onExit: function(){
              console.log('Saliendo del estado tab.account')
            }
          });
  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/dash');
      $urlRouterProvider.otherwise('/app');
});
