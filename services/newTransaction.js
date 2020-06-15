'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'ap-south-1', apiVersion: '2012-08-10'});

exports.NewTransaction = (event, context, callback) => { 
    var date = new Date(event.dateTime);
    var currMonth = date.getMonth()+1;
    var currYear = date.getFullYear();

    //Set the new transaction params
    var newTranParam = {
        TableName: 'Transaction',
        Item: {
            'UserId' : {S: event.userId},
            'Amount' : {S: event.amount},
            'Category' : {S: event.category},
            'TransactionDateTime' : {S: event.dateTime + ":" + Math.floor(Math.random() * 60)},
            'Notes' : {S: event.note},
            'TranMonth' : {N: currMonth+""},
            'TranYear' : {N: currYear+""}
        }
    }

    dynamodb.putItem(newTranParam, (err, data) => {
        if(err) {
            console.log("Error:" + err);
            return callback(err, null);  
        } else {
            console.log("Creating new expense:" + data);
            

            //Get userExpense
            //Set the param for reading the userExpense data if already present in the Income table
            //So that we can use the existing data to add the new expense
            var getUserExpenseParam = {
                TableName: 'Income',
                ProjectionExpression: 'userExpense',
                FilterExpression: "expMonth = :currMonth and expYear = :currYear and UserId = :userId",
                ExpressionAttributeValues: {
                    ":currMonth" : { N : currMonth+""},
                    ":currYear" : { N : currYear+""},
                    ":userId" : {S : event.userId}
                }
            };

            dynamodb.scan(getUserExpenseParam, function(err, data) {
                var userExp = 0;
                console.log(JSON.stringify(data));
                if(err) {
                    console.log("Error:" + err);
                    return callback(err, null);
                } else {
                    if(!Object.keys(data.Items).length) {
                        //No data for userExpense so return 0
                        userExp = 0;
                    } else {
                        //Return the userExpense data
                        console.log("UserExpense:" + data.Items[0].userExpense.N);
                        userExp = data.Items[0].userExpense.N
                    }

                    //Update the Income
                    var totalExpAmt = (parseInt(userExp)) + parseInt(event.amount);
                    console.log("TotalExpAmount:" + totalExpAmt);
                    var updateIncomeParam = {
                        TableName: 'Income',
                        Key: {
                            'expMonth': { N: currMonth+""},
                            'expYear': { N: currYear+""}
                        },
                        UpdateExpression: "set userExpense = :usrExp",
                        ConditionExpression: "UserId = :userId",
                        ExpressionAttributeValues: {
                            ":usrExp": { N: totalExpAmt+""},
                            ":userId" : { S : event.userId+""}
                        },
                        ReturnValues: "UPDATED_NEW"
                    }
                    dynamodb.updateItem(updateIncomeParam, (err, data) => {
                        if(err) {
                            console.log("Error:" + err);
                            return callback(err, null);
                        } else {
                            console.log("Success:" + data);
                            var retMsg = {
                                dataSaved: true,
                                msg: "Transaction added into database."
                            }
                        }
                    });
                }
            });
            return callback(null, data);
        }
    });
};


