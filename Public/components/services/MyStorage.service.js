;(function() { angular.module('boilerplate')
.factory('MyStorage', ['$http', MyStorageService]);

 function MyStorageService ($http){
    return {
        getdata: function(){
              return $http.get('../data/words.json'); 
        }
    };
 }
 
})();