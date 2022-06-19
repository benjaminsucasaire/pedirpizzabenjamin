'use strict';

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const orderMetadataManager = require('./orderMetadataManager');

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = (event, context, callback) => {
	console.log('HacerPedido fue llamada');

	const body = JSON.parse(event.body);

	const order = {
		OrderId: uuidv4(),
		name: body.name,
		address: body.address,
		pizzas: body.pizzas,
		timestamp: Date.now()
	};

	const params = {
		MessageBody: JSON.stringify(order),
		QueueUrl: QUEUE_URL
	};

	sqs.sendMessage(params, function(err, data) {
		if (err) {
			sendResponse(500, err, callback);
		} else {
			const message = {
				order: order,
				messageId: data.MessageId
			};
			sendResponse(200, message, callback);
		}
	});
};

module.exports.prepararPedido = (event, context, callback) => {
	console.log('Preparar pedido fue llamada');

	const order = JSON.parse(event.Records[0].body);

	orderMetadataManager
		.saveCompletedOrder(order)
		.then(data => {
			callback();
			console.log('correcto abel');
		})
		.catch(error => {
			callback(error);
			console.log('error benjamin');
		});
};

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}
