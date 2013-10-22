define(function () {
  // set toasts to show for only 2 seconds & in top right of screen
  toastr.options.timeOut = 2000;
  toastr.options.positionClass = "toast-top-right";

  // define routes available in app
  var routes = [{
                  url: "learningPaths",
                  moduleId: "viewModels/learningPaths",
                  name: "Learning Paths",
                  visible: true
                }, {
                  url: "learningItems",
                  moduleId: "viewModels/learningItems",
                  name: "Learning Items",
                  visible: true
                }];
  // what is the starting module when app loads
  var startModule = "learningPaths";

  return {
    routes: routes,
    startModule: startModule
  };

});