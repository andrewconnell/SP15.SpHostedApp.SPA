var ACI = ACI || {};

//#region entities
ACI.Models = ACI.Models || {}

/* entity - LearningPath */
ACI.Models.LearningPath = function () {
  this.Id = ko.observable(0);
  this.Title = ko.observable("");
  this.Description = ko.observable("");
  this.Published = ko.observable();
  this.WorkflowPublishing = ko.observable();
  this._etag = ko.observable(0);
  this._permalink = ko.observable("");
};

/* entity - LearningItem */
ACI.Models.LearningItem = function () {
  this.Id = ko.observable(0);
  this.Title = ko.observable("");
  this.Description = ko.observable("");
  this.ItemType = ko.observable("");
  this.URL = ko.observable("");
  this.AssociatedLearningPath = ko.observable(new ACI.Models.LearningPath);
  this._etag = ko.observable(0);
  this._permalink = ko.observable("");
};

/* entity - dialog mode */
ACI.Models.DialogMode = function () {
  var isNew = false;
  var isEdit = false;
  var isDelete = false;
  var isView = false;

  var self = {
    isNew: isNew,
    isEdit: isEdit,
    isDelete: isDelete,
    isView: isView,

    reset: reset
  };
  return self;

  //#region internals
  function reset() {
    isNew = false;
    isEdit = false;
    isDelete = false;
    isView = false;
  };

  //#endregion
};

//#endregion

//#region globals
ACI.Globals = ACI.Globals || {}

/* null guid */
ACI.Globals.NullGuid = "00000000-0000-0000-0000-000000000000";
//#endregion

//#region enumerations
ACI.Enums = ACI.Enums || {}

ACI.Enums.ItemTypes = function () {
  return [
    'Article',
    'Blog Post',
    'Book',
    'Conference',
    'Hands On Lab',
    'Training Course',
    'Screencast'
  ];
};
//#endregion