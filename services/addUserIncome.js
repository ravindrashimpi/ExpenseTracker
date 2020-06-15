'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'ap-south-1', apiVersion: '2012-08-10'});

exports.AddUserIncome = (event, context, callback) => { 
    console.log("UserID:" + event.userId);
    console.log("Income:" + event.userIncome);
    var date = new Date();
    var currMonth = date.getMonth()+1;
    var currYear = date.getFullYear();
    
    //Set the params
    var params = {
        TableName: 'Income',
        Item: {
            'UserId' : {S: event.userId},
            'userIncome' : {N: event.userIncome},
            'expMonth' : {N: currMonth+""},
            'expYear' : {N: currYear+""},
            'userExpense': {N : "0"}
        }
    }

    dynamodb.putItem(params, (err, data) => {
        if(err) {
            console.log("Error:" + err);
            return callback(err, null);
        } else {
            console.log("Success:" + data);
            return callback(null, data);
        } 
    });
};


