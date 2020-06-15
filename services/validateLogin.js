'use strict';
const AWS = require("aws-sdk")
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch')

exports.ValidateLogin = (event, context, callback) => {

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: event.emailId,
    Password: event.password
  });

  const poolData = {
    UserPoolId: 'ap-south-1_PRWAbvjzt',
    ClientId: '679ffkdariqd8i6pet1vaarkk'
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username: event.emailId,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      // console.log('access token + ' + result.getAccessToken().getJwtToken());
      // console.log('id token + ' + result.getIdToken().getJwtToken());
      // console.log('refresh token + ' + result.getRefreshToken().getToken());
      console.log("Valid User Message");
      return callback(null, "VALID_USER");
    },
    onFailure: (err) => {
      console.log("Error:" + err.message);
      return callback(new Error(err.message), null);
    }
  });
};
