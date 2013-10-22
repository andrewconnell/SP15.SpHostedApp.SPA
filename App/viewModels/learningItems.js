define(function (require) {
  var system = require('durandal/system'),
      router = require('durandal/plugins/router'),
      logger = require('services/logger'),
      dataService = require('services/dataService');

  // local learning items
  var learningItems = ko.observableArray();
  // learning items in the cloud
  var liveLearningItems = ko.observableArray();

  // private collection of learning paths
  var liveLearningPaths = ko.observableArray();
  var unPublishedLearningPaths = ko.observableArray();
  var publishedLearningPaths = ko.observableArray();
  var learningPaths = ko.computed(function () {
    return unPublishedLearningPaths().concat(publishedLearningPaths());
  });
  
  // if a learning path is selected, use it
  var currentLearningItem = ko.observable(new ACI.Models.LearningItem);

  // helper array of item types
  var itemTypes = ko.observableArray(new ACI.Enums.ItemTypes);

  var dialogState = new ACI.Models.DialogMode;

  // flag indicating if the data has been loaded
  var initialized = false;

  var viewModel = {
    activate: activate,
    router: router,
    refresh: refresh,

    title: 'Learning Items',
    itemTypes: itemTypes,
    unPublishedLearningPaths: unPublishedLearningPaths,

    learningItems: learningItems,
    liveLearningItems: liveLearningItems,
    currentLearningItem: currentLearningItem,

    RefreshCommand: RefreshCommand,
    NewCommand: NewCommand,
    EditCommand: EditCommand,
    DeleteCommand: DeleteCommand,

    dialogConfirmClick: dialogConfirmClick,
    addLearningItem: addLearningItem,
    updateLearningItem: updateLearningItem,
    deleteLearningItem: deleteLearningItem
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

    // load learning paths
    logger.log("Obtaining (local) unpublished learning paths...", viewModel, system.getModuleId(viewModel), false);
    return dataService.getUnPublishedLearningPaths(unPublishedLearningPaths)
            .then(function () {
              logger.log("Obtaining (local) published learning paths...", viewModel, system.getModuleId(viewModel), false);
              return dataService.getPublishedLearningPaths(publishedLearningPaths)
                .then(function () {
                  // get live published items
                  logger.log("Obtaining (cloud) published learning paths...", viewModel, system.getModuleId(viewModel), false);
                  dataService.getLivePublishedLearningPaths(liveLearningPaths)
                  return loadLearningItems();
                })
            });
  };

  /* load all the learning items */
  function loadLearningItems() {
    logger.log("loadLearningItems()", null, system.getModuleId(viewModel), false);

    // get unpublished items
    logger.log("Obtaining (local) unpublished learning items...", viewModel, system.getModuleId(viewModel), false);
    return dataService.getLearningItems(learningItems, learningPaths)
      .then(function () {
      // get live published items
      logger.log("Obtaining (cloud) published learning items...", viewModel, system.getModuleId(viewModel), false);
      dataService.getLiveLearningItems(liveLearningItems, liveLearningPaths);
      logger.log("All Learning Items Loaded", viewModel, system.getModuleId(viewModel), true);
    });;
  };

  /* dialog routing function */
  function dialogConfirmClick(){
    if (dialogState.isNew){
      addLearningItem();
    } else if (dialogState.isEdit){
      updateLearningItem();
    } else if (dialogState.isDelete){
      deleteLearningItem();
    }
  };

  /* save a learning item */
  function addLearningItem() {
    logger.log("addLearningItem()", currentLearningItem(), system.getModuleId(viewModel), false);

    // validate
    if (currentLearningItem().Title().length === 0 || currentLearningItem().Description().length === 0) {
      return false;
    };

    $("#modalDialog").modal('hide');

    // save the item
    return dataService.saveLearningItem(currentLearningItem())
            .then(function () {
              logger.logSuccess("Learning Item Saved", null, system.getModuleId(dataService), true);

              // refresh the unpublished items
              dataService.getLearningItems(learningItems, learningPaths);
              logger.log("Refreshed Unpublished Learning Items", null, system.getModuleId(dataService), true);

              // reset the current item to nothing
              currentLearningItem(new ACI.Models.LearningItem);
            })
            .fail(onSaveLearningItemFail);
  };

  /* update learning item */
  function updateLearningItem() {
    logger.log("updateLearningItem()", currentLearningItem(), system.getModuleId(viewModel), false);

    // validate
    if (currentLearningItem().Title().length === 0 || currentLearningItem().Description().length === 0) {
      return false;
    };

    $("#modalDialog").modal('hide');

    // save the item
    return dataService.saveLearningItem(currentLearningItem())
            .then(function () {
              logger.logSuccess("Learning Item Saved", null, system.getModuleId(dataService), true);

              // refresh the unpublished items
              dataService.getLearningItems(learningItems, learningPaths);
              logger.log("Refreshed Unpublished Learning Items", null, system.getModuleId(dataService), true);

              // reset the current item to nothing
              currentLearningItem(new ACI.Models.LearningItem);
            })
            .fail(onSaveLearningItemFail);
  };

  /* delete learning item */
  function deleteLearningItem() {
    logger.log("deleteLearningItem()", currentLearningItem(), system.getModuleId(viewModel), false);

    // hide dialog
    $("#modalDialog").modal('hide');

    // delete the item
    return dataService.deleteLearningItem(currentLearningItem())
              .then(function () {
                logger.logSuccess("Learning Item Deleted", null, system.getModuleId(dataService), true);

                // refresh the unpublished items
                dataService.getLearningItems(learningItems, learningPaths);
                logger.log("Refreshed Unpublished Learning Items", null, system.getModuleId(dataService), true);

                // reset the current item to nothing
                currentLearningItem(new ACI.Models.LearningItem);
              })
              .fail(onDeleteLearningItemFail);
  };

  /* handle any errors when saving learning item */
  function onSaveLearningItemFail(error) {
    logger.log("onSaveLearningItemFail()", error, system.getModuleId(dataService), false);
    var errorMessage = "Error saving Learning Item. " + error;
    logger.logError(errorMessage, error, system.getModuleId(viewModel), true);
  };

  /* handle any errors when deleting learning item */
  function onDeleteLearningItemFail(error) {
    logger.log("onDeleteLearningItemFail()", error, system.getModuleId(dataService), false);
    var errorMessage = "Error deleting Learning Item. " + error;
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
    currentLearningItem(new ACI.Models.LearningItem);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Create New Learning Item")
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
  function EditCommand(learningItemSelected) {
    logger.log("EditCommand()", learningItemSelected, system.getModuleId(viewModel), false);

    // update selected item
    currentLearningItem(learningItemSelected);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Edit Learning Item")
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
  function DeleteCommand(learningItemSelected) {
    logger.log("DeleteCommand()", learningItemSelected, system.getModuleId(viewModel), false);

    // update selected item
    currentLearningItem(learningItemSelected);

    // setup dialog UI
    $("#modalDialog div.modal-header > h3").html("Delete Learning Item")
    $("#modalDialog div.modal-subheader").html("Are you sure you want to delete this learning item?")
    $("#modalDialog :input").attr('readonly','readonly');
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

  //#endregion

});