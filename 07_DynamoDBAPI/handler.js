'use strict';
let AWS = require('aws-sdk');
let DynamoDB = new AWS.DynamoDB();
let DynamoDBDocClient = new AWS.DynamoDB.DocumentClient();
// Function: sleep
function sleep(time) {
	const d1 = new Date();
	while (true) {
		const d2 = new Date();
		if (d2 - d1 > time) {
			return;
		}
	}
}
// Entry point
module.exports.access = async (event) => {
	// Create DynamoDB table
	const create_table_params = {
		TableName : "Movies",
		KeySchema: [
			{ AttributeName: "year", KeyType: "HASH"},		// Partition key
			{ AttributeName: "title", KeyType: "RANGE" }	// Sort key
		],
		AttributeDefinitions: [
			{ AttributeName: "year", AttributeType: "N" },
			{ AttributeName: "title", AttributeType: "S" },
			{ AttributeName: "price", AttributeType: "S" }
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 10, 
			WriteCapacityUnits: 10
		},
		GlobalSecondaryIndexes: [
			{
				IndexName: "price-index",
				KeySchema: [
					{ AttributeName: "price", KeyType: "HASH" }
				],
				Projection: {
					ProjectionType: 'KEYS_ONLY'
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 10,
					WriteCapacityUnits: 10
				}
			}
		]
	};
	try {
		const data = await DynamoDB.createTable(create_table_params).promise();
		console.log("Created table: ", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to create table.");
		console.error(ee);
	}
	sleep(15000);
	// Register item
	const register_item_params = {
		TableName: "Movies",
		Item:{
			"year": 2015,
			"title": "The Big New Movie",
			"price": "10000",
			"info":{
				"plot": "Nothing happens at all.",
				"rating": 0
			}
		}
	};
	try {
		const data = await DynamoDBDocClient.put(register_item_params).promise();
		console.log("Add item:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to put table.");
		console.error(ee);
	}
	sleep(3000);
	// Get item
	const get_item_params = {
		TableName: "Movies",
		Key:{
			"year": 2015,
			"title": "The Big New Movie"
		}
	};
	try {
		const data = await DynamoDBDocClient.get(get_item_params).promise();
		console.log("Get item:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to get item.");
		console.error(ee);
	}
	sleep(3000);
	// Get item by global secondary index
	const query_params = {
		TableName: "Movies",
		IndexName: "price-index",
		KeyConditionExpression: "#partitionKeyName = :partitionKeyValue",
		ExpressionAttributeNames: { "#partitionKeyName": "price" },
		ExpressionAttributeValues: { ":partitionKeyValue": "10000" }
	};
	try {
		const data = await DynamoDBDocClient.query(query_params).promise();
		console.log("Get item by global secondary index:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to get item by global secondary index.");
		console.error(ee);
	}
	//sleep(3000);
	// Update item
	const update_item_params = {
		TableName: "Movies",
		Key:{
			"year": 2015,
			"title": "The Big New Movie"
		},
		UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
		ExpressionAttributeValues:{
			":r":5.5,
			":p":"Everything happens all at once.",
			":a":["Larry", "Moe", "Curly"]
		},
		ReturnValues:"UPDATED_NEW"
	};
	try {
		const data = await DynamoDBDocClient.update(update_item_params).promise();
		console.log("Update item:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to update item.");
		console.error(ee);
	}
	//sleep(3000);
	// Delete item
	const delete_item_params = {
		TableName: "Movies",
		Key:{
			"year": 2015,
			"title": "The Big New Movie"
		}
	}
	try {
		const data = await DynamoDBDocClient.update(delete_item_params).promise();
		console.log("Delete item:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to delete item.");
		console.error(ee);
	}
	// Delete DynamoDB table
	const delete_table_params = {
		TableName : "Movies"
	};
	try {
		const data = await DynamoDB.deleteTable(delete_table_params).promise();
		console.log("Delete table:", JSON.stringify(data, null, 2));
	} catch (ee) {
		console.error("Unable to delete table.");
		console.error(ee);
	}
	// Return response
	return {statusCode: 200, body: "OK"};
};
