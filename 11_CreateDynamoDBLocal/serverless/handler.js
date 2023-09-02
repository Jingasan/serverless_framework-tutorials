'use strict';
const AWS = require("aws-sdk");
AWS.config.update({
	accessKeyId: "dummy",
	secretKey: "dummy",
	region: "ap-northeast-1",
	endpoint: "http://localhost:8000"
});
const docClient = new AWS.DynamoDB.DocumentClient();
// Entry point
module.exports.scan = async () => {
	let res = [];
	const params = {
		TableName: 'students',
	};
	// Get all data in table
	try {
		const data = await docClient.scan(params).promise();
		console.log("Success: Scan DynamoDB table.");
		data.Items.forEach(function(student, index){
			res.push({name: student.name});
			console.log(student.name);
		});
	} catch (ee) {
		console.log("Failure: Scan DynamoDB table.");
		console.log(ee);
	}
	return {statusCode: 200, body: JSON.stringify(res)};
};