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
    .controller('UploadController', UploadController);

  UploadController.$inject = ['FileUploader', '$scope', '$window'];


  function UploadController(FileUploader, $scope, $window) {
    var self = this;
    var ref = firebase.database().ref("audioFileNames");
    var fileNamesFromFirebase = [];
    var files = [];
    var filesAddedNow = [];
    var uploadTask;

    $scope.fileContent;
    $scope.sample;

    var uploader = $scope.uploader = new FileUploader({
    });

    // FILTERS

    // a sync filter
    uploader.filters.push({
      name: 'syncFilter',
      fn: function (item /*{File|FileLikeObject}*/, options) {
        console.log('syncFilter', item);
        $scope.sample = item;
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

    ref.once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        fileNamesFromFirebase.push(childData);
      });
    });
    uploader.uploadToFirebase = function () {
      angular.forEach(files, function (value) {
        var storageRef = firebase.storage().ref(value.name);
        uploadTask = storageRef.put(value);

      });



    };

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
      console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
      console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
      console.info('onAfterAddingAll', addedFileItems);

      for (var i = 0; i < addedFileItems.length; i++) {
        files.push(addedFileItems[i]._file);
        filesAddedNow.push(addedFileItems[i]._file.name);
      }

      var filesNotAdded = _.difference(fileNamesFromFirebase, filesAddedNow);
      var extraFilesAdded = _.difference(filesAddedNow, fileNamesFromFirebase)

      if (filesNotAdded.length > 0) {
        $window.alert('The following files were not added: \n' + filesNotAdded);
      }
      if (extraFilesAdded.length > 0) {
        $window.alert('The following files extra were added :\n' + extraFilesAdded);
      }

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
      uploadTask.cancel();
      console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
      console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
      // console.log('All files', files);
      uploader.uploadToFirebase();
      console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

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