'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-south-1', apiVersion: '2012-08-10' });

exports.GetCategories = (event, context, callback) => {

    var getCategoriesParam = {
        TableName: 'Category',
        ProjectionExpression: 'CategoryName, CategoryCode'
    };

    //Get Categories
    dynamodb.scan(getCategoriesParam, function (err, data) {
        if (err) {
            console.log("Error:" + err);
            return callback(err, null);
        } else {
            var categories;
            if (!Object.keys(data.Items).length) {
                categories = {};
            } else {
                //Return the userExpense data
                //console.log(data.Items);
                categories = data.Items;
            }
            return callback(null, categories);
        }
    });
};


