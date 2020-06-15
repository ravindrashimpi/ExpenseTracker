'use strict';
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
global.fetch  = require('node-fetch')

const poolData = {
  UserPoolId: 'ap-south-1_PRWAbvjzt',
  ClientId: '679ffkdariqd8i6pet1vaarkk' 
};

exports.TokenValidation = (event, context, callback) => {

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username: event.emailId,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(event.securityCode, true, (err, result) => {
    if(err) {
      return callback(err, null);
    }

    return callback(null,result);
  });
  
};
