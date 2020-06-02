﻿
# UIPath Module

  

The UiPath Custom Module can be used to interface with the UiPath Orchestrator API.
[Orchestrator API Reference](https://docs.uipath.com/orchestrator/reference/api-references)
  
It currently features the 5 operations that are listed below.

**Secret: (UIPath)**
This module requires a Cognigy Secret with the following keys:

1. client_id
2. refresh_token
3. account_logical_name
4. service_instance_logical_name

You can obtain these, by following the instructions listed here: 
[https://docs.uipath.com/cloudplatform/docs/about-api-access](https://docs.uipath.com/cloudplatform/docs/about-api-access)
  

## Node: getReleases

Use this node, to get a list of releases that can be triggered using the startJob node below. The getReleases node produces an array of process releases, as shown in the following screenshot. The "id" property is the required release key. 

![An example getReleases response](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/uipath-screens/releases.png)

## Node: startJob

The startJob node has a number of required paramaters. These include: 
- a Secret
- A release key (obtained by using the getReleases node)
- Strategy (Specific is used by default)
- RobotId (This can be obtained by navigating to [https://platform.uipath.com/odata/Robots](https://platform.uipath.com/odata/Robots) while being logged in to the Orchestrator API in your browser. It should return a JSON object that includes the "Id" key with an integer number, which is the RobotId) 
- Lastly, some option input arguments can be send along. This could for example be dynamic information that the bot obtained from the user. You can use the [CognigyScript](https://docs.cognigy.com/docs/cognigyscript) syntax to send along dynamic information in JSON format. 

![An example comfiguration for the startJob node](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/uipath-screens/startjob.png)  

## Node: getJobs
Returns a list of Jobs that are currently deployed. Can be useful in order for the bot the check on the status of a certain process. 


## Node: getQueueItem

Use this node to retrieve an item from a specific UiPath Queue.   

The "filter" property can be used to get a specific item (e.g. Status eq 'InProgress' and Robot/Id eq 749).

Please refer to the following documentation for more information:
[Retrieving Specific Transactions](https://docs.uipath.com/orchestrator/reference/retrieving-specific-transactions)

## Node: addQueueItem

Use this node to add an item to a specific UiPath Queue. 

Please refer to the following documentation for more information:
[Retrieving Specific Transactions](https://docs.uipath.com/orchestrator/reference/retrieving-specific-transactions)

