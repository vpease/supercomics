/**
 * Created by vpease on 26/03/15.
 */
angular.module('Super',[])

/* Detectar si es movil o desktop */
.factory ('Super',function(){
    self.mobile='';

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i)|| false;
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i)|| false;
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i)|| false;
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i)|| false;
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)|| false;
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    return {
        set: function(){
            self.mobile = isMobile.any();
            console.log ('Es mobile: '+isMobile.any());
        },
        getMobile: function() {
            return self.mobile;
        }
    }
})

