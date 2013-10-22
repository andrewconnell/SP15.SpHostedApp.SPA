define(function () {

  var learningPaths;

  var LearningItem = function (dto, lps) {
    if (lps !== undefined) {
      learningPaths = lps;
    }

    var entity = new ACI.Models.LearningItem;
    // if no learning learningItem passed in, create skeleton object
    if (dto !== undefined) {
      entity.Id(dto.Id);
      entity.Title(dto.Title);
      entity.Description(dto.OData__Comments);
      entity.ItemType(dto.ItemType);
      entity.URL(dto.URL.Url);
      entity._etag(dto.__metadata.etag);
      entity._permalink(dto.__metadata.uri);

      var lp = getAssociatedLearningPath(dto.LearningPath.Id);
      entity.AssociatedLearningPath(lp);
    }

    return entity;
  };

  var model = {
    LearningItem: LearningItem
  };

  return model;

  //#region internals

  /* find the associated learning path with this learning item */
  function getAssociatedLearningPath(learningPathId) {
    var result = new ACI.Models.LearningPath;
    // find the mapped learning path & add a property for the name and if it is published
    var items = Enumerable.From(learningPaths());
    // use linq.js to create LINQ queries
    var query = items.FirstOrDefault(undefined, function (lp) { return lp.Id() == learningPathId; });
    if (query !== undefined) {
      result = query;
    }
    return result;
  };

  //#endregion internals
});