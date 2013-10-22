define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger');

  var baseRequest = {
    url: "",
    type: ""
  };

  var module = {
    getRequest: getRequest,
    newItemRequest: newItemRequest,
    updateItemRequest: updateItemRequest,
    deleteItemRequest: deleteItemRequest
  };

  return module;

  /* create a new OData request for JSON response */
  function getRequest(endpoint) {
    var request = baseRequest;
    request.type = "GET";
    request.url = endpoint;
    request.headers = { ACCEPT: "application/json;odata=verbose" };

    return request;
  };

  /* create a new OData request for JSON response for creating item */
  function newItemRequest(endpoint, payload) {
    var request = baseRequest;
    request.url = endpoint;
    request.type = "POST";
    request.contentType = "application/json;odata=verbose";
    request.headers = {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                      };
    request.data = payload;
    return request;
  };

  /* create a new OData request for JSON response for updating item */
  function updateItemRequest(endpoint, payload, eTag) {
    var request = baseRequest;
    request.url = endpoint;
    request.type = "POST";
    request.contentType = "application/json;odata=verbose";
    request.headers = {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "X-HTTP-Method": "MERGE",
                        "If-Match": eTag
                      };
    request.data = payload;
    return request;
  };

  /* create a new OData request for JSON response for deleting item */
  function deleteItemRequest(endpoint) {
    var request = baseRequest;
    request.url = endpoint;
    request.type = "DELETE";
    request.contentType = "application/json;odata=verbose";
    request.headers = {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "If-Match": "*"
                      };

    return request;
  };
});