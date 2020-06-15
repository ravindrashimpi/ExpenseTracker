'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'ap-south-1', apiVersion: '2012-08-10'});

exports.AddCategory = (event, context, callback) => { 
    
    //Set the params
    var params = {
        TableName: 'Category',
        Item: {
            'CategoryName' : {S: event.CategoryName},
            'CategoryCode' : {S: event.CategoryCode}
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


