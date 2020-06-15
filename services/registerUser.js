'use strict';
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
global.fetch = require('node-fetch')

const poolData = {
  UserPoolId: 'ap-south-1_PRWAbvjzt',
  ClientId: '679ffkdariqd8i6pet1vaarkk'
};

exports.RegisterUser = (event, context, callback) => {

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'given_name', Value: event.firstName }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'family_name', Value: event.lastName }));

  userPool.signUp(event.emailId, event.password, attributeList, null, (err, result) => {
    console.log("Error:" + err);
    if (err) {
      console.log(err.message || JSON.stringify(err));
      return callback(err.message, null);
    }

    const msg = {
      "MSG": "User " + result.user.getUsername() + " has been register. Security code send to " + event.emailId
    }
    return callback(null, msg);
  });


};
