define(function (require) {
  var system = require('durandal/system'),
      logger = require('services/logger');

  // core SharePoint CSOM context
  var clientContext = null;
  // SharePoint workflow engine CSOM
  var workflowServiceManager = null;
  var workflowDeploymentService = null;
  var workflowSubscriptionService = null;
  var workflowInstanceService = null;

  // GUID of the workflow definition
  var wfDefinitionGuid = ACI.Globals.NullGuid;

  // GUID of the workflow subscription on the list
  //  aka: association of workflow on learning path list
  var wfSubscriptionGuid = ACI.Globals.NullGuid;

  // GUID of the learning path list
  var learningPathListGuid = ACI.Globals.NullGuid;

  // initialization flag
  var initalized = false;

  // setup promise support
  //var deferred = new Array();

  var workflowService = {
    startPublishWorkflow: startPublishWorkflow
  };
  return workflowService;



  /* start a workflow */
  function startPublishWorkflow(learningPathId) {
    // ensure connected to SharePoint
    return connectToSharePoint(clientContext, workflowServiceManager, workflowDeploymentService, workflowSubscriptionService, workflowInstanceService)
      .then(function (ctx, sm, ds, ss, is) {
        clientContext = ctx;
        workflowServiceManager = sm;
        workflowDeploymentService = ds;
        workflowSubscriptionService = ss;
        workflowInstanceService = is;

        // async get the (a) learning path list id & (b) workflow definition id
        $.when(
          // get id of learning path list
          getLearningPathListId(learningPathListGuid),

          // get id of workflow definition
          getPublishWorkflowDefinition(wfDefinitionGuid)

        ).done(function (listId, definitionId) {
          learningPathListGuid = listId;
          wfDefinitionGuid = definitionId;

          // get id of the workflow definition & subscription on learning path list
          getPublishWorkflowSubscriptionId(learningPathListGuid, wfDefinitionGuid, wfSubscriptionGuid)
            .then(function (wfs) {
              wfSubscriptionGuid = wfs.get_id().toString();

              // start the workflow
              executeWorkflowStart(wfs, learningPathId);
            }) // then > getPublishWorkflowSubscriptionId()
        }); // when-done
      }); // then > connectToSharePoint()
  };


  //#region internals

  /* connect to SharePoint */
  function connectToSharePoint(context, serviceManager, deploymentService, subscriptionService, instanceService) {
    logger.log("connectToSharePoint()", null, system.getModuleId(workflowService), false);

    // setup promise
    var deferred = $.Deferred();

    // check if already connected...
    if (serviceManager !== null ||
        deploymentService !== null ||
        subscriptionService !== null ||
        instanceService !== null) {
      deferred.resolve(context, serviceManager, deploymentService, subscriptionService, instanceService);
      logger.log("Skipping init of SharePoint and Workflow CSOM... already done", context, system.getModuleId(workflowService), false);
    } else { // else if not connected, connect
      // init
      context = SP.ClientContext.get_current();
      serviceManager = SP.WorkflowServices.WorkflowServicesManager.newObject(context, context.get_web());
      deploymentService = serviceManager.getWorkflowDeploymentService()
      subscriptionService = serviceManager.getWorkflowSubscriptionService();
      instanceService = serviceManager.getWorkflowInstanceService();

      // obtain references from SharePoint
      context.load(subscriptionService);
      context.load(instanceService);
      context.executeQueryAsync(
        // success callback
        Function.createDelegate(this, function () {
          logger.log("SharePoint CSOM and workflow CSOM services initalized", context, system.getModuleId(workflowService), false);
          deferred.resolve(context, serviceManager, deploymentService, subscriptionService, instanceService);
        }),
        // failed callback
        Function.createDelegate(this, function (sender, args) {
          logger.logError("Error initializing SharePoint and workflow CSOM. Contact your system administrator.", args, system.getModuleId(workflowService), true);
          deferred.reject(sender, args);
        })
      );
    }

    // return a promise
    return deferred.promise();
  };

  /* obtain the guid of the learning path list */
  function getLearningPathListId(learningPathListGuid) {
    logger.log("getLearningPathListId()", learningPathListGuid, system.getModuleId(workflowService), false);

    // setup promise
    var deferred = $.Deferred();

    if (learningPathListGuid !== ACI.Globals.NullGuid) {
      deferred.resolve(learningPathListGuid);
      logger.log("Skipping acquisition of list ID... already have it", learningPathListGuid, system.getModuleId(workflowService), false);
    } else {
      // get the learning path list id
      var learningPathList = clientContext.get_web().get_lists().getByTitle("Learning Paths");
      clientContext.load(learningPathList);
      clientContext.executeQueryAsync(
           // success callback
          Function.createDelegate(this, function () {
            logger.log("Obtained Learning Path List ID", learningPathList.get_id(), system.getModuleId(workflowService), false);
            deferred.resolve(learningPathList.get_id());
          }),
          // fail callback
          Function.createDelegate(this, function (sender, args) {
            logger.logError("Error obtaining Learning Path List. Contact your system administrator.", args, system.getModuleId(workflowService), true);
            deferred.reject(sender, args);
          })
       );
    }

    // return a promise
    return deferred.promise();
  };

  /* obtain the workflow definition */
  function getPublishWorkflowDefinition(wfDefinitionId) {
    logger.log("getPublishWorkflowDefinition()", wfDefinitionId, system.getModuleId(workflowService), false);

    // setup promise
    var deferred = $.Deferred();

    if (wfDefinitionId !== ACI.Globals.NullGuid) {
      deferred.resolve(wfDefinitionId);
      logger.log("Skipping acquisition of definition ID... already have it", wfDefinitionId, system.getModuleId(workflowService), false);
    } else {
      // enumerate through all published workflow definitions
      var workflowDefinitions = workflowDeploymentService.enumerateDefinitions(true);
      clientContext.load(workflowDefinitions);
      clientContext.executeQueryAsync(
          // success callback
          Function.createDelegate(this, function () {
            var found = false;

            // find the only workflow definition
            var enumerator = workflowDefinitions.getEnumerator();
            while (enumerator.moveNext()) {
              var definition = enumerator.get_current();
              if (definition.get_displayName() === "Publish Learning Path Workflow") {
                // get the GUID of the definition
                wfDefinitionId = definition.get_id().toString();
                found = true;
                break; // from while loop
              }
            }

            // error handlers
            if (found === false) {
              logger.logError("Didn't Find Workflow. Contact your system administrator.", null, system.getModuleId(workflowService), true);
              deferred.reject();
            } else {
              logger.log("Obtained Workflow Definition 'Publish Learning Path Workflow'", wfDefinitionId, system.getModuleId(workflowService), false);
              deferred.resolve(wfDefinitionId);
            }
          }),
          // failed callback
          Function.createDelegate(this, function (sender, args) {
            deferred.reject(sender, args);
          })
      );
    }

    // return a promise
    return deferred.promise();
  };

  /* obtain the workflow subscription (aka: association) from the learning path list */
  function getPublishWorkflowSubscriptionId(learningPathListGuid, workflowDefinitionId, workflowSubscriptionGuid) {
    logger.log("getPublishWorkflowSubscriptionId()", null, system.getModuleId(workflowService), false);

    // setup promise
    var deferred = $.Deferred();

    if (workflowSubscriptionGuid !== ACI.Globals.NullGuid) {
      deferred.resolve(workflowSubscriptionGuid);
      logger.log("Skipping acquisition of subscription ID... already have it", workflowSubscriptionGuid, system.getModuleId(workflowService), false);
    } else {
      // enumerate through all workflow subscriptions (should only be one)
      var workflowSubscriptions = workflowSubscriptionService.enumerateSubscriptionsByList(learningPathListGuid);
      clientContext.load(workflowSubscriptions);
      clientContext.executeQueryAsync(
          // success callback
          Function.createDelegate(this, function () {
            // find the only workflow subscription
            var enumerator = workflowSubscriptions.getEnumerator();
            while (enumerator.moveNext()) {
              var found = false;

              var subscription = enumerator.get_current();
              if (subscription.get_definitionId().toString() === workflowDefinitionId) {
                // get the GUID of the subscription
                workflowSubscriptionGuid = subscription.get_id().toString();
                found = true;
                break; // from while loop
              }
            }

            // error handlers
            if (found === false) {
              logger.logError("Didn't Find Workflow Subscription. Contact your system administrator.", null, system.getModuleId(workflowService), true);
              deferred.reject();
              // no errors, success handback
            } else {
              logger.log("Obtained Workflow Subscription", workflowSubscriptionGuid, system.getModuleId(workflowService), false);
              deferred.resolve(subscription);
            }
          }),
          // failed callback
          Function.createDelegate(this, function (sender, args) {
            deferred.reject(sender, args);
          })
      );
    }

    // return a promise
    return deferred.promise();
  };

  /* start the workflow */
  function executeWorkflowStart(workflowSubscription, learningPathItemId) {
    logger.log("executeWorkflowStart()", workflowSubscription, system.getModuleId(workflowService), false);

    // setup promise
    var deferred = $.Deferred();

    workflowInstanceService.startWorkflowOnListItem(workflowSubscription, learningPathItemId, new Object());
    clientContext.executeQueryAsync(
           // success callback
          Function.createDelegate(this, function () {
            logger.logSuccess("Publish workflow started", this, system.getModuleId(workflowService), true);
            deferred.resolve(this);
          }),
          // fail callback
          Function.createDelegate(this, function (sender, args) {
            logger.logError("Error starting workflow. Contact your system administrator.", args, system.getModuleId(workflowService), true);
            deferred.reject(sender, args);
          })
      );

    // return a promise
    return deferred.promise();
  };

  //#endregion

});