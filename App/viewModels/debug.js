define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger'),
      spCurrentPageUtils = require('services/spCurrentPageUtils');

  var enabled = ko.observable();

  var viewModel = {
    activate: activate,
    isEnabled: enabled,
    toggleDebug: toggleDebug,
    seeODataManagementPage: seeODataManagementPage,
    seeODataService: seeODataService,
    seeListLearningPaths: seeListLearningPaths,
    seeListLearningItems: seeListLearningItems
  };

  return viewModel;

  function activate() {
    return;
  };

  /* toggle the enabled / disabled state */
  function toggleDebug() {
    if (enabled()) {
      enabled(false);
    } else { enabled(true); }
  }

  /* opens a new window and navigates to hosted OData management page */
  function seeODataManagementPage() {
    logger.log('seeODataManagementPage()', null, system.getModuleId(viewModel), false);
    window.open("http://spevo.azurewebsites.net/Management.aspx", "_blank");
  };

  /* opens a new window and navigates to hosted OData service */
  function seeODataService() {
    logger.log('seeODataService()', null, system.getModuleId(viewModel), false);
    window.open("http://spevo.azurewebsites.net/LearningPathsOdata.svc", "_blank");
  };

  /* opens a new window and navigates to the Learning Paths list */
  function seeListLearningPaths() {
    logger.log('seeListLearningPaths()', null, system.getModuleId(viewModel), false);
    window.open(spCurrentPageUtils.learningPathsListAbsoluteUrl(), "_blank");
  };

  /* opens a new window and navigates to the Learning Items list */
  function seeListLearningItems() {
    logger.log('seeListLearningItems()', null, system.getModuleId(viewModel), false);
    window.open(spCurrentPageUtils.learningItemsListAbsoluteUrl(), "_blank");
  };
});