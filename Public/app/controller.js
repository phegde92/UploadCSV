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
    var words = [];
    var finalFileContent;
    $scope.validatedCSV = "";
    var rowIndex;
    var isSuccess = false;
    var isError = false;
    $scope.isValidated = [];
    for (var n = 0; n < 100; ++n) {
      $scope.isValidated[n] = false;
    }

    $scope.showMessage = false;
    $scope.numOfFilesExceeded = "Please select only one file. Remove the other files to continue.."
    var uploader = $scope.uploader = new FileUploader({
    });

    uploader.filters.push({
      name: 'syncFilter',
      fn: function (item /*{File|FileLikeObject}*/, options) {
        console.log('syncFilter', item);
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

    uploader.validateCSV = function (index) {
      console.log('index', index);
      console.log('isValidated', $scope.isValidated);
      rowIndex = index;
      parseCSV($scope.fileContent);
    };

    String.prototype.escapeSpecialChars = function () {
      return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\r/g, '')
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    };

    uploader.uploadToFirebase = function () {

      var data = JSON.stringify(words);
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
      if (uploader.queue.length > 1) {
        console.log('over one file');
      }
      finalFileContent = $scope.fileContent;
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
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
      uploader.uploadToFirebase();
      console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

    // 'controller as' syntax





    // var ref = firebase.database().ref().child("words");
    // var words = $firebaseArray(ref);
    // console.log(words);
    $scope.validateCSV = function (index) {
      console.log('index', index);
      // $scope.isValidated = true;
      parseCSV(csvFile);
    };

    function handleParseResult(result) {
      console.log('Parsed result', result);
      if (result.errors.length > 0) {
        $scope.message = 'Invalid CSV file';
      }
      else {
        var count = 0;
        for (count = 0; count < result.data.length; count++) {
          var defExObjects = [];
          var wordObject = {};
          console.log('fishy',result.data);
          var defPlusExample = result.data[count]['Definition+Example'];
          console.log(defPlusExample);
          if (defPlusExample != undefined) {
            $scope.isValidated[rowIndex] = true;
            $scope.message = "";
            var defExArray = defPlusExample.split(";");
            // console.log('defExArray', defExArray);
            if (defExArray.length > 0) {
              for (var i = 0; i < defExArray.length; i++) {
                if (defExArray[i].length > 0) {
                  var defEx = defExArray[i].split(':');
                  // console.log('Each Def Example', defEx);
                  if (defEx.length > 1) {
                    var defExObject = {};
                    var examples = defEx[1].split('|');
                    // console.log('Definition', defEx[0]);
                    // console.log('Examples for each def', examples);
                    defExObject['Definition'] = defEx[0];
                    defExObject['Examples'] = examples;
                    defExObjects.push(defExObject);
                  }
                }
              }
              createWordObjects(result.data[count], defExObjects);
            }
            else {
              $scope.message = 'Invalid CSV file';
            }
          }
          else {
            $scope.message = 'Invalid CSV file';
          }
        }

      }
      // angular.forEach(result.data, function(value){
      //   console.log('Each one',value['Definition+Example']);
      // var array = value['Definition+Example'].split(";");  
      // var defExObject = {};
      // console.log('array of defExs', array);


      // });
      // var array = result.data[0]['Definition+Example'].split(";");
      // var firstWordDef = array[0].split(':');
      // var secondWordDef = array[1].split(':');
      // console.log("after split", array);
      // console.log("firstWordDef", firstWordDef);
      // console.log("akdfjjtWordDef", secondWordDef);


    }

    function createWordObjects(mainWordObj, defExObjects) {
      var newWord = new WordObj(defExObjects, mainWordObj["Grammar Info"], mainWordObj["Idioms"], mainWordObj["Phrasal Verb"], mainWordObj["Pronunciation"],
        mainWordObj["Related Vocabulary"], mainWordObj["Roots"], mainWordObj["Translation"], mainWordObj["Word"]);

      words.push(newWord);
      console.log('Final Parsed result', words);

    }

    function WordObj(wordDefs, grammarInfo, idioms, phrasalVerb, pronunciation, relatedVocab, roots, translation, word) {
      this.definitionExample = wordDefs;
      this.grammarInfo = grammarInfo;
      this.idioms = idioms;
      this.phrasalVerb = phrasalVerb;
      this.pronunciation = pronunciation;
      this.relatedVocabulary = relatedVocab;
      this.roots = roots;
      this.translation = translation;
      this.word = word;
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

    function parseDefEx(data) {
      Papa.parse(data, {
        delimiter: ";",	// auto-detect
        newline: "\n",	// auto-detect
        header: false,
        encoding: "UTF-8",
      })
        .then(handleParseResultDefEx)
        .catch(handleParseErrorDefEx)
        .finally(parsingFinishedDefEx);
    }

    function handleParseErrorDefEx(result) {
      console.log('Errors', result);
    }

    function parsingFinishedDefEx() {
      // whatever needs to be done after the parsing has finished
    }

    function handleParseResultDefEx(result) {
      console.log(result);
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