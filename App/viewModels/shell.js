define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger'),
      router = require('durandal/plugins/router'),
      config = require('config');

  var viewModel = {
    activate: activate,
    router: router
  };

  return viewModel;

  function activate() {
    logger.log('LearningPath Manager App Shell Loaded', null, system.getModuleId(viewModel), false);

    // configure routes
    router.map(config.routes);
    return router.activate(config.startModule);
  }
});