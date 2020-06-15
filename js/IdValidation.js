// Object.keys(localStorage).forEach(function(key){
//     console.log(localStorage.getItem(key));
//  });
const poolData = {
    UserPoolId: 'ap-south-1_PRWAbvjzt',
    ClientId: '679ffkdariqd8i6pet1vaarkk'
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();

if(cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
        if(err) {
            console.log("Error in getting session:" + err);
            return;
        }
        //console.log("Session:" + JSON.stringify(session));
        if(session.isValid()) {
            cognitoUser.getUserAttributes(function (err, attributes) {
                if(err) {
                    console.log("Error in getting attribute");
                    return;
                }
                // var firstName = attributes[2].Value;
                // var lastName = attributes[3].Value;
                $('#loginUserName').html("<p> Welcome " + attributes[2].Value + " " +  attributes[3].Value + "</p>")
            });
        } else {
            console.log("Session Invalid. Redirect to Login Page.");
            $(location).attr('href','401.html');    
            return;
        }
        
    });
} else {
    console.log("Cognito User Null. Redirect to Login Page.");
    $(location).attr('href','401.html');    
}