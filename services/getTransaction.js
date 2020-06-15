'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-south-1', apiVersion: '2012-08-10' });

exports.GetTransaction = (event, context, callback) => {
    var date = new Date();
    var currMonth = date.getMonth() + 1;
    var currYear = date.getFullYear();

    var getTransactionParam = {
        TableName: 'Transaction',
        ProjectionExpression: 'UserId, TransactionDateTime, Amount, Category, Notes',
        FilterExpression: "UserId = :userId and TranMonth = :tranMonth and TranYear = :tranYear",
        ExpressionAttributeValues: {
            ":userId": { S: event.userId },
            ":tranMonth": { N: currMonth + "" },
            ":tranYear": { N: currYear + "" },
        }
    };

    //Get Transaction
    dynamodb.scan(getTransactionParam, function (err, data) {
        if (err) {
            console.log("Error:" + err);
            return callback(err, null);
        } else {
            console.log("Data:" + data);
            return callback(null, data);
        }
    });
};


