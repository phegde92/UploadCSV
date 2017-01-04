/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 * 
 */
; (function () {

  angular
    .module('boilerplate')
    .controller('MainController', MainController);

  MainController.$inject = ['LocalStorage', 'QueryService', '$firebaseArray', 'MyStorage'];


  function MainController(LocalStorage, QueryService, $firebaseArray, MyStorage) {
  // 'controller as' syntax
    var self = this;
    var ref = firebase.database().ref();
    var words;
    MyStorage.getdata().success(function (data) {
      console.log('success', data);
      words = data.words;
      ref.set(words);
    });
    


    // var ref = firebase.database().ref().child("words");
    // var words = $firebaseArray(ref);
    // console.log(words);
    var uploadData = function () {

    };

    ////////////  function definitions


    /**
     * Load some data
     * @return {Object} Returned object
     */
    // QueryService.query('GET', 'posts', {}, {})
    //   .then(function(ovocie) {
    //     self.ovocie = ovocie.data;
    //   });
  }


})();