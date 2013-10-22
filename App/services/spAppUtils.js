define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger');

  var module = {
    getAppAbsoluteUrl: getAppAbsoluteUrl,
    getAppRelativeUrl: getAppRelativeUrl,
    getAppODataApiUrl: getAppODataApiUrl
  };
  return module;

  function getAppAbsoluteUrl() {
    logger.log("getAppAbsoluteUrl()", _spPageContextInfo, system.getModuleId(module), false);
    return _spPageContextInfo.webAbsoluteUrl;
  };

  function getAppRelativeUrl() {
    logger.log("getAppRelativeUrl()", _spPageContextInfo, system.getModuleId(module), false);
    return _spPageContextInfo.webServerRelativeUrl;
  };

  function getAppODataApiUrl() {
    logger.log("getAppODataApiUrl()", null, system.getModuleId(module), false);
    return getAppAbsoluteUrl() + "/_api";
  };
});