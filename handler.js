'use strict';

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

var sqs = new AWS.SQS({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = (event, context, callback) => {
	console.log('HacerPedido fue llamada');
	const orderId = uuidv4();

	const params = {
		MessageBody: JSON.stringify({ orderId: orderId }),
		QueueUrl: QUEUE_URL
	};

	sqs.sendMessage(params, function(err, data) {
		if (err) {
			sendResponse(500, err, callback);
		} else {
			const message = {
				orderId: orderId,
				messageId: data.MessageId
			};
			sendResponse(200, message, callback);
		}
	});
};

module.exports.prepararPedido = (event, context, callback)=>{
	console.log('prepararPedido fue llamado');
	console.log(event);
	callback();
};

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}
