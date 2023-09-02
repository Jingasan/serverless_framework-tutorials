'use strict';
const AWS = require("aws-sdk");
const SQS = new AWS.SQS({ region: "ap-northeast-1" });
const QueueUrl = "https://sqs.ap-northeast-1.amazonaws.com/622838898203/TestQueue.fifo";
// CORS
const cors = {
	"Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST,GET"
};
/******************** Sender ********************/
// Function: Send message to SQS FIFO queue
async function SendOrder(table_id, item, amount) {
	const MessageBody = JSON.stringify({
		TableID: table_id,
		Item: item,
		Amount: amount,
		OrderedTime: Date.now()
	});
	const MessageGroupId = "Order";
	const message_param = {
		MessageBody,
		QueueUrl,
		MessageGroupId	
	};
	try {
		await SQS.sendMessage(message_param).promise();
		console.log("Successful: Send message to SQS FIFO queue.");
		console.log(MessageBody);
	} catch (ee) {
		console.error("Failure: Send message to SQS FIFO queue.");
		console.error(ee);
	}
}
// Entry point
module.exports.send = async (event) => {
	// Parse http request body
	// {
	//   "body": {
	//     "orders": [
	//       { "TableID": "A", "Item": "ハンバーガー", "Num": 1 },
	//       { "TableID": "B", "Item": "ポテト", "Num": 1 }
	//     ]
	//   }
	// }
	let body;
	try {
		body = JSON.parse(event.body);
	} catch (error) {
		body = event.body;
	}
	// Send order
	for (let order of body.orders) {
		await SendOrder(order.TableID, order.Item, order.Num);
	}
	// Return response
	return {statusCode: 200, headers: cors, body: "OK"};
};
/******************** Receiver ********************/
// Function: Receive message from SQS FIFO queue
async function ReceiveOrder() {
	let message = {};
	const param = {
		QueueUrl,
		MaxNumberOfMessages: 10,
		WaitTimeSeconds: 3
	};
	try {
		message = await SQS.receiveMessage(param).promise();
		console.log("Successful: Receive message from SQS FIFO queue.");
	} catch (ee) {
		console.error("Failure: Receive message from SQS FIFO queue.");
		console.error(ee);
	}
	return message;
}
// Function: Delete message from SQS FIFO queue
async function DeleteOrder(ReceiptHandle) {
	const param = {
		QueueUrl,
		ReceiptHandle
	};
	try {
		const res = await SQS.deleteMessage(param).promise();
		console.log("Successful: Delete message from SQS FIFO queue.");
		console.log(res);
	} catch (ee) {
		console.error("Failure: Delete message from SQS FIFO queue.");
		console.error(ee);
	}
}
// Entry point
module.exports.receive = async () => {
	let response_body = {
		orders: []
	};
	// Receive order
	const orders = await ReceiveOrder();
	if ('Messages' in orders) {
		// Delete order
		for (let message of orders.Messages) {
			const order = message.Body;
			console.log(order);
			response_body.orders.push(order);
			await DeleteOrder(message.ReceiptHandle);
		}		
	}
	// Return response
	return {statusCode: 200, headers: cors, body: JSON.stringify(response_body)};
};