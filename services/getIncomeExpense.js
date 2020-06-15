'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-south-1', apiVersion: '2012-08-10' });

exports.GetIncomeExpense = (event, context, callback) => {

    //Set the update income param
    var date = new Date();
    var currMonth = date.getMonth() + 1;
    var currYear = date.getFullYear();

    console.log("CurrentMonth:" + currMonth);
    console.log("CurrentYear:" + currYear);
    console.log("UserId:" + event.userId);

    var getIncomeExpenseParam = {
        TableName: 'Income',
        ProjectionExpression: 'UserId, userExpense, userIncome',
        FilterExpression: "UserId = :userId and ExpMonthYear = :expMonthYear",
        ExpressionAttributeValues: {
            ":userId": { S: event.userId },
            ":expMonthYear": { S: currMonth + "#" + currYear }
        }
    };

    //Get Categories
    dynamodb.scan(getIncomeExpenseParam, function (err, data) {
        if (err) {
            console.log("Error:" + err);
            return callback(err, null);
        } else {
            var incomeExp;
            if (!Object.keys(data.Items).length) {
                incomeExp = {};
            } else {
                //Return the userExpense data
                //console.log(data.Items);
                incomeExp = data;
            }
            return callback(null, incomeExp);
        }
    });
};


