define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger'),
      lpModel = require('models/learningPath')
      liModel = require('models/learningItem'),
      spAppUtils = require('services/spAppUtils'),
      oDataUtils = require('services/oDataUtils'),
      liveServiceUtils = require('services/liveServiceUtils');

  /* observable collection of all UN-PUBLISHED learning paths */
  var getUnPublishedLearningPaths = function (collection) {
    return getLearningPaths(collection, false);
  };

  /* observable collection of all PUBLISHED learning paths */
  var getPublishedLearningPaths = function (collection) {
    return getLearningPaths(collection, true);
  };

  // setup promise support
  var deferred = $.Deferred();

  var dataService = {
    getUnPublishedLearningPaths: getUnPublishedLearningPaths,
    getPublishedLearningPaths: getPublishedLearningPaths,
    getLivePublishedLearningPaths: getLivePublishedLearningPaths,
    deleteLearningPath: deleteLearningPath,
    saveLearningPath: saveLearningPath,

    getLearningItems: getLearningItems,
    getLiveLearningItems: getLiveLearningItems,
    deleteLearningItem: deleteLearningItem,
    saveLearningItem: saveLearningItem
  };

  return dataService;

  //#region learning paths

  /* fetch learning paths from SharePoint list */
  function getLearningPaths(collection, published) {
    logger.log("getLearningPaths()", null, system.getModuleId(dataService), false);

    // reset observable
    collection([]);

    // get all learning paths
    var query = spAppUtils.getAppODataApiUrl()
                  + "/web/lists/getbytitle('Learning Paths')/Items"
                  + "?$select=Id,Title,Published,Keywords1,OData__Comments"
                  + "&$filter=Published eq '" + ((published) ? 1 : 0) + "'"
                  + "&$orderby=Title";

    // execute query
    return $.ajax(oDataUtils.getRequest(query))
            .then(onSuccess)
            .fail(onGetLearningPathFail);

    /* retrieve results */
    function onSuccess(data) {
      logger.log("getLearningPaths.onSuccess()", data, system.getModuleId(dataService), false);

      var results = [];
      // for each tiem, convert to an entity & add to collection
      $.each(data.d.results, function (i, item) {
        // convert returned object to entity
        var lp = new lpModel.LearningPath(item);
        results.push(lp);
      });

      // update observable
      collection(results);
    };
  };

  /* fetch learning paths from cloudy OData service */
  function getLivePublishedLearningPaths(collection) {
    logger.log("getLivePublishedLearningPaths()", null, system.getModuleId(dataService), false);

    // reset observable
    collection([]);

    // get all learning paths
    var query = liveServiceUtils.getServiceUrl()
                        + "/LearningPaths"
                        + "?$select=Id,Title,Description,PublishDate,PublishedBy";

    // execute query
    OData.defaultHttpClient.enableJsonpCallback = true;
    return OData.read({
      requestUri: query,
      headers: { accept: "application/json;odata=verbose" }
    }, getLivePublishedLearningPathsSuccess
     , onGetLearningPathFail);

    function getLivePublishedLearningPathsSuccess(data) {
      logger.log("getLivePublishedLearningPaths.getLivePublishedLearningPathsSuccess()", data, system.getModuleId(dataService), false);

      var learningPaths = [];
      $.each(data.results, function (i, item) {
        var lp = {
          Id: item.Id,
          Title: item.Title,
          Description: item.Description,
          PublishDate: item.PublishDate,
          PublishedBy: item.PublishedBy
        };
        learningPaths.push(lp);
      });

      // update observable
      collection(learningPaths);
    };
  };

  /* save the provided learning path */
  function saveLearningPath(learningPath) {
    logger.log("saveLearningPath()", learningPath, system.getModuleId(dataService), false);

    var endpoint = "";
    var requestData = {};

    // create the JSON object to submit
    var payload = buildJsonLearningPathPayload(learningPath)

    // build the REST query if new/update
    if (learningPath._etag() !== 0) {
      // update
      endpoint = learningPath._permalink();
      requestData = oDataUtils.updateItemRequest(endpoint, payload, learningPath._etag());
    } else {
      // new
      endpoint = spAppUtils.getAppODataApiUrl()
                  + "/web/lists/getbytitle('Learning Paths')/Items";
      requestData = oDataUtils.newItemRequest(endpoint, payload);
    };

    // add handlers
    requestData.success = function (response) { deferred.resolve(response); };
    requestData.error = function (error) { deferred.reject(error); };

    // submit query
    $.ajax(requestData);

    return deferred;
  };

  /* delete learning path */
  function deleteLearningPath(learningPath) {
    logger.log("deleteLearningPath()", learningPath, system.getModuleId(dataService), false);

    var endpoint = learningPath._permalink();
    var requestData = oDataUtils.deleteItemRequest(endpoint);

    // add handlers
    requestData.success = function (response) { deferred.resolve(response); };
    requestData.error = function (error) { deferred.reject(error); };

    // submit query
    $.ajax(requestData);

    return deferred;
  };

  //#endregion


  //#region learning items

  /* fetch all learning path items for the specified learnign path */
  function getLearningItems(collection, learningPaths) {
    logger.log("getLearningItems()", null, system.getModuleId(dataService), false);

    // reset observable
    collection([]);

    // get all learning paths
    var query = spAppUtils.getAppODataApiUrl()
                  + "/web/lists/getbytitle('Learning Items')/Items"
                  + "?$select=Id,Title,ItemType,URL,OData__Comments,LearningPath/Id"
                  + "&$expand=LearningPath/Id"
                  + "&$orderby=Title";

    // execute query
    return $.ajax(oDataUtils.getRequest(query))
            .then(onSuccess)
            .fail(onGetLearningItemFail);

    /* retrieve results */
    function onSuccess(data) {
      logger.log("getLearningItems.onSuccess()", data, system.getModuleId(dataService), false);

      var results = [];
      // for each tiem, convert to an entity & add to collection
      $.each(data.d.results, function (i, item) {
        // convert returned object to entity
        var lp = new liModel.LearningItem(item, learningPaths);
        results.push(lp);
      });

      // update observable
      collection(results);
    };
  };

  /* fetch learning path items from cloudy OData service */
  function getLiveLearningItems(collection, learningPaths) {
    logger.log("getLiveLearningItems()", null, system.getModuleId(dataService), false);

    // reset observable
    collection([]);

    // get all learning paths
    var query = liveServiceUtils.getServiceUrl()
                        + "/LearningItems"
                        + "?$select=Id,Title,Description,ItemType,URL";

    // execute query
    OData.defaultHttpClient.enableJsonpCallback = true;
    return OData.read({
      requestUri: query,
      headers: { accept: "application/json;odata=verbose" }
    }, getLivePublishedLearningItemsSuccess
     , onGetLearningItemFail);

    function getLivePublishedLearningItemsSuccess(data) {
      logger.log("getLiveLearningItems.getLivePublishedLearningItemsSuccess()", data, system.getModuleId(dataService), false);

      var learningItems = [];
      $.each(data.results, function (i, item) {
        var li = new ACI.Models.LearningItem;
        li.Id(item.Id);
        li.Title(item.Title);
        li.Description(item.Description);
        li.URL(item.URL);

        switch (item.ItemType) {
          case 1:
            li.ItemType("Article"); break;
          case 2:
            li.ItemType("Blog Post"); break;
          case 3:
            li.ItemType("Training Course"); break;
          case 4:
            li.ItemType("Screencast"); break;
          case 5:
            li.ItemType("Book"); break;
          case 6:
            li.ItemType("Conference"); break;
          case 7:
            li.ItemType("Hands On Lab"); break;
        };

        learningItems.push(li);
      });

      // update observable
      collection(learningItems);
    };
  };

  /* save the provided learning item */
  function saveLearningItem(learningItem) {
    logger.log("saveLearningItem()", learningItem, system.getModuleId(dataService), false);

    var endpoint = "";
    var requestData = {};

    // create the JSON object to submit
    var payload = buildJsonLearningItemPayload(learningItem)

    // build the REST query if new/update
    if (learningItem._etag() !== 0) {
      // update
      endpoint = learningItem._permalink();
      requestData = oDataUtils.updateItemRequest(endpoint, payload, learningItem._etag());
    } else {
      // new
      endpoint = spAppUtils.getAppODataApiUrl()
              + "/web/lists/getbytitle('Learning Items')/Items";
      requestData = oDataUtils.newItemRequest(endpoint, payload);
    };

    // add handlers
    requestData.success = function (response) { deferred.resolve(response); };
    requestData.error = function (error) { deferred.reject(error); };

    // submit query
    $.ajax(requestData);

    return deferred;
  };

  /* delete learning item */
  function deleteLearningItem(learningItem) {
    logger.log("deleteLearningItem()", learningItem, system.getModuleId(dataService), false);

    var endpoint = learningItem._permalink();
    var requestData = oDataUtils.deleteItemRequest(endpoint);

    // add handlers
    requestData.success = function (response) { deferred.resolve(response); };
    requestData.error = function (error) { deferred.reject(error); };

    // submit query
    $.ajax(requestData);

    return deferred;
  };

  //#endregion

  //#region internals

  /* handle any errors when fetching learning paths */
  function onGetLearningPathFail(xhr, status) {
    logger.log("onGetLearningPathFail()", null, system.getModuleId(dataService), false);
    var error = "Error getting Learning Paths. " + status;
    logger.logError(error, xhr, system.getModuleId(dataService), true);
  };

  /* handle any errors when fetching learning items */
  function onGetLearningItemFail(xhr, status) {
    logger.log("onGetLearningItemFail()", null, system.getModuleId(dataService), false);
    var error = "Error getting Learning Items. " + status;
    logger.logError(error, xhr, system.getModuleId(dataService), true);
  };

  /* Create a JSON object to post to the learning path */
  function buildJsonLearningPathPayload(learningPath) {
    var payload = {
      __metadata: { "type": "SP.Data.LearningPathsListItem" },
      Title: learningPath.Title(),
      OData__Comments: learningPath.Description(),
      Published: 'False'
    };

    return JSON.stringify(payload);
  };

  /* Create a JSON object to post to the learning item */
  function buildJsonLearningItemPayload(learningItem) {
    var payload = {
      __metadata: { "type": "SP.Data.LearningItemsListItem" },
      Title: learningItem.Title(),
      OData__Comments: learningItem.Description(),
      URL: {Url: learningItem.URL(),
            Description: learningItem.URL()},
      ItemType: learningItem.ItemType(),
      LearningPathId: learningItem.AssociatedLearningPath().Id()
    };

    return JSON.stringify(payload);
  };
  //#endregion
});