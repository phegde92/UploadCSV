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
    var self = this;
    var ref = firebase.database().ref("words");
    var csvFile;
    var words;
    $scope.validatedCSV = "";



    $scope.isValidated = false;
    $scope.showMessage = false;
    var uploader = $scope.uploader = new FileUploader({
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
      console.log('fileContent', $scope.fileContent);
      parseCSV($scope.fileContent);
    };

    String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\r/g, '')
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
};

    uploader.uploadToFirebase = function () {

        console.log('success', $scope.validatedCSV.data);
        var data = JSON.stringify($scope.validatedCSV.data);
        var preparedData = data.escapeSpecialChars();
        var JSONObject = JSON.parse(preparedData);
        
        // words = data.words;
        ref.set(JSONObject);


    };
    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
      console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
      if(uploader.queue.length>1) {
        console.log('over one file');
      }
      console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
      csvFile = addedFileItems[0];
      // console.info('onAfterAddingAll', addedFileItems);
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
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
      console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
      uploader.uploadToFirebase();
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
      console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

    // 'controller as' syntax





    // var ref = firebase.database().ref().child("words");
    // var words = $firebaseArray(ref);
    // console.log(words);
    $scope.validateCSV = function () {
      
      $scope.isValidated = true;
      parseCSV(csvFile);
    };

    function handleParseResult(result) {
      console.log('Parsed result', result);
      if (result.errors.length > 0) {
        $scope.message = 'Invalid CSV file';
      }
      else {
        $scope.isValidated = true;
        console.log('Def+Example', result.data[0]['Definition+Example']);
        var array = result.data[0]['Definition+Example'].split("|");
        var firstWordDef = array[0].split(':');
        var secondWordDef = array[1].split(':');
        console.log("after split", array);
        console.log("firstWordDef", firstWordDef);
        console.log("akdfjjtWordDef", secondWordDef);
        $scope.validatedCSV = result;
      }

    }

    function handleParseError(result) {
      console.log('Errors', result);
    }

    function parsingFinished() {
      // whatever needs to be done after the parsing has finished
    }

    function parseCSV(data) {
      Papa.parse(data, {
        delimiter: ",",	// auto-detect
        newline: "\n",	// auto-detect
        header: true,
        encoding: "UTF-8",
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