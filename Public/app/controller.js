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

  MainController.$inject = ['LocalStorage', 'QueryService', '$firebaseArray', 'MyStorage', 'FileUploader', '$scope', 'Papa'];


  function MainController(LocalStorage, QueryService, $firebaseArray, MyStorage, FileUploader, $scope, Papa) {
    var csvFile;
    $scope.isValidated = false;
    var uploader = $scope.uploader = new FileUploader({
      url: 'upload.php'
    });

    uploader.filters.push({
      name: 'syncFilter',
      fn: function (item /*{File|FileLikeObject}*/, options) {
        console.log('syncFilter');
        return this.queue.length < 10;
      }
    });

    // an async filter
    uploader.filters.push({
      name: 'asyncFilter',
      fn: function (item /*{File|FileLikeObject}*/, options, deferred) {
        console.log('asyncFilter');
        setTimeout(deferred.resolve, 1e3);
      }
    });

    uploader.validateCSV = function () {
      console.log('hello', $scope.fileContent);
      $scope.isValidated = true;
      parseCSV($scope.fileContent);
    };
    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
      console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
      console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
      console.log('all files', addedFileItems);
      csvFile = addedFileItems[0];
      console.log('Have the file in', csvFile);
      console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {
      console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
      console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
      console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
      console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
      console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
      console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
      console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

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
    $scope.validateCSV = function () {
      $scope.isValidated = true;
      console.log('hello', $);
      parseCSV(csvFile);
    };

    function handleParseResult(result) {
      console.log('Parsed Data', result);
    }

    function handleParseError(result) {
      console.log('Errors', result);
    }

    function parsingFinished() {
      // whatever needs to be done after the parsing has finished
    }

    function parseCSV(data) {
      Papa.parse(data, {
        delimiter: "",	// auto-detect
        newline: "",	// auto-detect
        header: true
      })
        .then(handleParseResult)
        .catch(handleParseError)
        .finally(parsingFinished);
    }

    function jsonToCSV(json) {
      Papa.unparse(data)
        .then(handleParseResult)
        .catch(handleParseError)
        .finally(parsingFinished);
    }

    angular.extend(this, {
      parseCSV: parseCSV,
      jsonToCSV: jsonToCSV
    });

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