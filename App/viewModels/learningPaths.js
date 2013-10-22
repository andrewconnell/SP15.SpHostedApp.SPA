define(function (require) {
  var system = require('durandal/system'),
      router = require('durandal/plugins/router'),
      logger = require('services/logger'),
      dataService = require('services/dataService'),
      workflowService = require('services/workflowService');

  // local learning paths
  var publishedLearningPaths = ko.observableArray();
  var unPublishedLearningPaths = ko.observableArray();
  var allLearningPaths = ko.computed(function () {
    return unPublishedLearningPaths().concat(publishedLearningPaths());
  });
  // learning paths in the cloud
  var publishedLiveLearningPaths = ko.observableArray();

  // if a learning path is selected, use it
  var currentLearningPath = ko.observable(new ACI.Models.LearningPath);

  var dialogState = new ACI.Models.DialogMode;

  // flag indicating if the data has been loaded
  var initialized = false;

  var viewModel = {
    title: 'Learning Paths',
    activate: activate,
    router: router,
    refresh: refresh,

    publishedLearningPaths: publishedLearningPaths,
    publishedLiveLearningPaths: publishedLiveLearningPaths,
    unPublishedLearningPaths: unPublishedLearningPaths,
    learningPaths: allLearningPaths,
    currentLearningPath: currentLearningPath,

    RefreshCommand: RefreshCommand,
    NewCommand: NewCommand,
    EditCommand: EditCommand,
    DeleteCommand: DeleteCommand,
    StartPublishWorkflowCommand: StartPublishWorkflowCommand,

    dialogConfirmClick: dialogConfirmClick,
    addLearningPath: addLearningPath,
    updateLearningPath: updateLearningPath,
    deleteLearningPath: deleteLearningPath
  };

  return viewModel;

  function activate() {
    // if initalized, previously, don't load the data
    if (initialized) { return; }
    initialized = true;

    return refresh();
  }

  /* refresh the viewModel */
  function refresh() {
    logger.log("refresh()", null, system.getModuleId(viewModel), false);

    return loadLearningPaths();
  };

  /* load all the learning paths */
  function loadLearningPaths() {
    logger.log("loadLearningPaths()", null, system.getModuleId(viewModel), false);

    // get unpublished items
    logger.log("Obtaining (local) unpublished learning paths...", viewModel, system.getModuleId(viewModel), false);
    return dataService.getUnPublishedLearningPaths(unPublishedLearningPaths)
              .then(function () {
                // get published items
                logger.log("Obtaining (local) published learning paths...", viewModel, system.getModuleId(viewModel), false);
                return dataService.getPublishedLearningPaths(publishedLearningPaths)
                  .then(function () {
                    // get live published items
                    logger.log("Obtaining (cloud) published learning paths...", viewModel, system.getModuleId(viewModel), false);
                    dataService.getLivePublishedLearningPaths(publishedLiveLearningPaths)
                    logger.log("All Learning Paths Loaded", viewModel, system.getModuleId(viewModel), true);
                    return;
                  })
              });
  };

  /* dialog routing function */
  function dialogConfirmClick() {
    if (dialogState.isNew) {
      addLearningPath();
    } else if (dialogState.isEdit) {
      updateLearningPath();
    } else if (dialogState.isDelete) {
      deleteLearningPath();
    }
  };

  /* save a learning path */
  function addLearningPath() {
    logger.log("addLearningPath()", currentLearningPath(), system.getModuleId(viewModel), false);

    // validate
    if (currentLearningPath().Title().length === 0 || currentLearningPath().Description().length === 0) {
      return false;
    };

    $("#modalDialog").modal('hide');

    // save the item
    return dataService.saveLearningPath(currentLearningPath())
            .then(function () {
              logger.logSuccess("Learning Path Saved", null, system.getModuleId(dataService), true);

              // refresh the unpublished items
              return dataService.getUnPublishedLearningPaths(unPublishedLearningPaths)
                      .then(function () {
                        logger.log("Refreshed Unpublished Learning Paths", null, system.getModuleId(dataService), true);

                        // reset the current item to nothing
                        currentLearningPath(new ACI.Models.LearningPath);
                      })
            })
            .fail(onSaveLearningPathFail);
  };

  /* update learning path */
  function updateLearningPath() {
    logger.log("updateLearningPath()", currentLearningPath(), system.getModuleId(viewModel), false);

    // validate
    if (currentLearningPath().Title().length === 0 || currentLearningPath().Description().length === 0) {
      return false;
    };

    $("#modalDialog").modal('hide');

    // save the item
    return dataService.saveLearningPath(currentLearningPath())
            .then(function () {
              logger.logSuccess("Learning Path Saved", null, system.getModuleId(dataService), true);

              // refresh the unpublished items
              return dataService.getUnPublishedLearningPaths(unPublishedLearningPaths)
                      .then(function () {
                        logger.log("Refreshed Unpublished Learning Paths", null, system.getModuleId(dataService), true);

                        // reset the current item to nothing
                        currentLearningPath(new ACI.Models.LearningPath);
                      })
            })
            .fail(onSaveLearningPathFail);
  };

  /* delete learning path */
  function deleteLearningPath() {
    logger.log("deleteLearningPath()", currentLearningPath(), system.getModuleId(viewModel), false);

    // hide dialog
    $("#modalDialog").modal('hide');

    // delete the item
    return dataService.deleteLearningPath(currentLearningPath())
              .then(function () {
                logger.logSuccess("Learning Path Deleted", null, system.getModuleId(dataService), true);

                // refresh the unpublished items
                return dataService.getUnPublishedLearningPaths(unPublishedLearningPaths)
                        .then(function () {
                          logger.log("Refreshed Unpublished Learning Paths", null, system.getModuleId(dataService), true);

                          // reset the current item to nothing
                          currentLearningPath(new ACI.Models.LearningPath);
                        })
              })
              .fail(onDeleteLearningPathFail);
  };

  /* handle any errors when saving learning path */
  function onSaveLearningPathFail(error) {
    logger.log("onSaveLearningPathFail()", error, system.getModuleId(dataService), false);
    var errorMessage = "Error saving Learning Path. " + error;
    logger.logError(errorMessage, error, system.getModuleId(viewModel), true);
  };

  /* handle any errors when deleting learning path */
  function onDeleteLearningPathFail(error) {
    logger.log("onDeleteLearningPathFail()", error, system.getModuleId(dataService), false);
    var errorMessage = "Error deleting Learning Path. " + error;
    logger.logError(errorMessage, error, system.getModuleId(viewModel), true);
  };




  //#region Commands

  /* handles when the refresh button is clicked */
  function RefreshCommand() {
    logger.log("RefreshCommand()", null, system.getModuleId(viewModel), false);

    return refresh();
  };

  /* handles when the new button is clicked */
  function NewCommand() {
    logger.log("NewCommand()", null, system.getModuleId(viewModel), false);

    // update selected item
    currentLearningPath(new ACI.Models.LearningPath);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Create New Learning Path")
    $("#modalDialog div.modal-subheader").html("")
    $("#modalDialog :input").removeAttr('readonly');
    $("#modalDialog #confirmButton").removeAttr("class");
    $("#modalDialog #confirmButton").removeAttr("class")
                                    .addClass("btn")
                                    .addClass("btn-primary");
    $("#modalDialog #confirmButton").html('Save');

    // set dialog state
    dialogState.reset();
    dialogState.isNew = true;

    // show dialog
    $("#modalDialog").modal('show');

    return;
  };

  /* handles when the edit button is clicked */
  function EditCommand(learningPathSelected) {
    logger.log("EditCommand()", learningPathSelected, system.getModuleId(viewModel), false);

    // update selected item
    currentLearningPath(learningPathSelected);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Edit Learning Path")
    $("#modalDialog div.modal-subheader").html("")
    $("#modalDialog :input").removeAttr('readonly');
    $("#modalDialog #confirmButton").removeAttr("class")
                                    .addClass("btn")
                                    .addClass("btn-primary");
    $("#modalDialog #confirmButton").html('Save');

    // set dialog state
    dialogState.reset();
    dialogState.isEdit = true;

    // show dialog
    $("#modalDialog").modal('show');

    return;
  };

  /* handles when the delete button is clicked */
  function DeleteCommand(learningPathSelected) {
    logger.log("DeleteCommand()", learningPathSelected, system.getModuleId(viewModel), false);

    // update selected item
    currentLearningPath(learningPathSelected);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Delete Learning Path")
    $("#modalDialog div.modal-subheader").html("Are you sure you want to delete this learning Path?")
    $("#modalDialog :input").attr('readonly', 'readonly');
    $("#modalDialog #confirmButton").removeAttr("class")
                                    .addClass("btn")
                                    .addClass("btn-danger");
    $("#modalDialog #confirmButton").html('Delete');

    // set dialog state
    dialogState.reset();
    dialogState.isDelete = true;

    // show dialog
    $("#modalDialog").modal('show');

    return;
  };

  /* kicks off the leanring path publication workflow */
  function StartPublishWorkflowCommand(learningPathSelected) {
    logger.log("StartPublishWorkflowCommand()", learningPathSelected, system.getModuleId(viewModel), false);

    logger.log("Starting workflow...", null, system.getModuleId(viewModel), true);
    return workflowService.startPublishWorkflow(learningPathSelected.Id()).then(function () { learningPathSelected.WorkflowPublishing(true); });
  };

  //#endregion

});