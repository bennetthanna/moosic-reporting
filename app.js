const AWS = require('aws-sdk');
const express = require('express');

const app = express();

const sqs = new AWS.SQS({ region: 'us-east-1' });

const SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/171578128461/reporting';

const params = {
    AttributeNames: [
        "All"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: SQS_QUEUE_URL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 20
};

function receiveMessages(parameters) {
    return sqs.receiveMessage(params).promise()
        .then(res => {
            if (res.Messages) {
                res.Messages.forEach(message => console.log(message.Body));
                const deleteParams = {
                  QueueUrl: SQS_QUEUE_URL,
                  ReceiptHandle: res.Messages[0].ReceiptHandle
                };
                return sqs.deleteMessage(deleteParams).promise();
            }
            return Promise.resolve();
        })
        .then(res => receiveMessages(params))
        .catch(err => {
            console.log(`\nError: ${err}\n`);
            return receiveMessages(params);
        });
}

receiveMessages(params);
