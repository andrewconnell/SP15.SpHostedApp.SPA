require.config({
  paths: { "text": "durandal/amd/text" }
});

//defined startup module
define(function (require) {
  var system = require('durandal/system'),
      app = require('durandal/app'),
      router = require('durandal/plugins/router'),
      viewLocator = require('durandal/viewLocator'),
      logger = require('services/logger');

  // turn on debugging (durandal will write messages to console window)
  system.debug(true);

  // start the application 
  // after app started, synchronously run and set the root of the app to the shell module
  app.start().then(function () {
    // use convetions for the routs
    // ie: viewmodels / views folders
    router.useConvention();

    // use convetions for the view locator
    // ie: viewmodels / views folders
    viewLocator.useConvention();

    // start the app by loading the shell
    app.setRoot('viewModels/shell', 'entrance');

    // override bad routes by showing a error message
    router.handleInvalidRouter = function (route, params) {
      logger.logError("No route found", route, 'main', true);
    };
  });
});