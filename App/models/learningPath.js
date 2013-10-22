define(function () {

  var LearningPath = function (dto) {
    var entity = new ACI.Models.LearningPath;

    // if no learning path passed in, create skeleton object
    if (dto !== undefined) {
      entity.Id(dto.Id);
      entity.Title(dto.Title);
      entity.Description(dto.OData__Comments);
      entity.Published(dto.Published);
      entity.WorkflowPublishing(false); //HACK: should query item to see if workflow is running
      entity._etag(dto.__metadata.etag);
      entity._permalink(dto.__metadata.uri);
    }

    return entity;
  };

  var model = {
    LearningPath: LearningPath
  };

  return model;
});