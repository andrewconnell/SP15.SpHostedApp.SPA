define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger');

  var module = {
    activate: activate,
    learningPathsListAbsoluteUrl: learningPathsListAbsoluteUrl,
    learningItemsListAbsoluteUrl: learningItemsListAbsoluteUrl
  };
  
  return module;

  function activate() {
    return;
  };

  /* retrieves the absolute URL for the Learning Paths list */
  function learningPathsListAbsoluteUrl() {
    logger.log("learningPathsListAbsoluteUrl()", _spPageContextInfo, system.getModuleId(module), false);

    // use the value from the OOTB variable to get the page root
    return _spPageContextInfo.webAbsoluteUrl + "/Lists/LearningPaths";
  };

  /* retrieves the absolute URL for the Learning Items list */
  function learningItemsListAbsoluteUrl() {
    logger.log("learningItemsListAbsoluteUrl()", _spPageContextInfo, system.getModuleId(module), false);

    // use the value from the OOTB variable to get the page root
    return _spPageContextInfo.webAbsoluteUrl + "/Lists/LearningItems";
  };
});