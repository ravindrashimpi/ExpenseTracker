'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'ap-south-1', apiVersion: '2012-08-10'});

exports.UserIncome = (event, context, callback) => { 
    console.log("UserID:" + event.userId);
    var date = new Date();
    var currMonth = date.getMonth()+1;
    var currYear = date.getFullYear();
    
    var params = {
        TableName: "Income",
        ProjectionExpression: "UserId, userExpense, userIncome, expMonth, expYear",
        FilterExpression: "expMonth = :currentMonth and expYear = :currentYear and UserId = :userId",
        ExpressionAttributeValues: {
            ":userId": { "S": event.userId},
            ":currentMonth": { "N": currMonth+""},
            ":currentYear": { "N": currYear+""}
        } 
    };

    dynamodb.scan(params, function(err, data) {
        if(err) {
            console.log("Unable to query. Error:", err.message);
            var errMsg = {
                "errMsg": "Something went wrong. Please contact your administrator."
            }
            return callback(errMsg, null);
        }
        console.log(data);
        if(data.Count == 0 ) {
            console.log(false);
            var retMsg = {
                "isIncomeExist": "false"
            }
            return callback(null, retMsg);
        } else {
            console.log(true);
            var retMsg = {
                "isIncomeExist": "true"
            }
            return callback(null, retMsg);
        }
    });
};


