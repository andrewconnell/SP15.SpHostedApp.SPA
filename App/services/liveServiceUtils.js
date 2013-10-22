define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger');

  var module = {
    getServiceUrl: getServiceUrl
  };
  return module;

  function getServiceUrl() {
    logger.log("getServiceUrl()", false);
    return "http://spevo.azurewebsites.net/LearningPathsOdata.svc";
  };
});