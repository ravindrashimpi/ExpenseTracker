$(function () {
    $('[data-toggle="popover"]').popover()
})

//Function used to logout
function logout() {
    const poolData = {
        UserPoolId: 'ap-south-1_PRWAbvjzt',
        ClientId: '679ffkdariqd8i6pet1vaarkk'
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();
    console.log("User Loggedout");
    $(location).attr('href', 'login.html');
}

//Function used to validate the user with the Security Code
function validateRegistrationCode() {
    if (validateVerificationCodeForm()) {
        $('#alerts').hide('slow');
        var poolData = {
            UserPoolId: 'ap-south-1_PRWAbvjzt',
            ClientId: '679ffkdariqd8i6pet1vaarkk'
        };

        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        var userData = {
            Username: $('#inputEmail').val(),
            Pool: userPool,
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.confirmRegistration($('#inputRegCode').val(), true, function (err, result) {
            if (err) {
                console.log("Error:" + err.message || JSON.stringify(err));
                $('#alerts').show('slow');
                $('#alerts').html("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
                return false;
            }
            console.log('call result: ' + result);
            $('#regVerificationModal').on("show.bs.modal", function (e) {
                $('#regVerModalMsg').html("<p>You have been successfully verified. You will be redirecting to login page.</p>");
            }).modal('show');

            $('#regVerificationModal').on("hidden.bs.modal", function (e) {
                $(location).attr('href', 'login.html');
            }).modal('hide');
        });
    }
}

//Function used to redirect flow to loginWithCode.html
function redirectToLoginWithRegCode() {
    $(location).attr('href', 'loginWithCode.html');
}

//Function used to register the user to Cognito
function registerUser() {
    if (validateNewUserRegistrationForm()) {
        $('#alerts').hide('slow');
        const poolData = {
            UserPoolId: 'ap-south-1_PRWAbvjzt',
            ClientId: '679ffkdariqd8i6pet1vaarkk'
        };

        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        const attributeList = [];
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'given_name', Value: $('#firstName').val() }));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'family_name', Value: $('#lastName').val() }));

        userPool.signUp($('#emailId').val(), $('#myPassword').val(), attributeList, null, (err, data) => {
            if (err) {
                //Display message related to error
                console.log("Error ->" + JSON.stringify(err));
                $('#alerts').show('slow');
                $('#alerts').html("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
                return false;
            }
            var msg = "User " + $('#firstName').val() + " " + $('#lastName').val() + " has been register. Security code send to " + data.user.getUsername();

            $('#regConfirmModel').on("show.bs.modal", function (e) {
                $('#modelMsg').html("<p>" + msg + "</p>");
            }).modal('show');
        });
    }
}

//Function get executed when user click on SignIn button on the login form
function validateLogin() {
    if (validateLoginForm()) {
        $('#alerts').hide('slow');
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: $('#inputEmail').val(),
            Password: $('#inputPassword').val()
        });

        const poolData = {
            UserPoolId: 'ap-south-1_PRWAbvjzt',
            ClientId: '679ffkdariqd8i6pet1vaarkk'
        };

        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        const userData = {
            Username: $('#inputEmail').val(),
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                //console.log('Access token + ' + result.getAccessToken().getJwtToken());
                // console.log('id token + ' + result.getIdToken().getJwtToken());
                // console.log('refresh token + ' + result.getRefreshToken().getToken());
                console.log(result);
                localStorage.setItem("accessToken", result.getAccessToken().getJwtToken());
                $(location).attr('href', 'dashboard.html');
            },
            onFailure: (err) => {
                console.log("Error:" + err.message);
                $('#alerts').show('slow');
                $('#alerts').html("<div class='alert alert-danger' role='alert'>" + err.message + "</div>");
                return false;
            }
        });

    }
}

//Function used to add Income
function addIncome(view) {
    if (validateAddUserIncome(view)) {
        var userData = {
            "userIncome": $('#userIncome').val()
        }

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("Error in getting session:" + err);
                    $(location).attr('href', '401.html');
                }

                if (session.isValid()) {
                    var AUTHORIZATION = session.getIdToken().getJwtToken();
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/addincome/');
                    xhr.setRequestHeader('Authorization', AUTHORIZATION);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onreadystatechange = function () {
                        console.log(xhr.status);
                        console.log(xhr.readyState);
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var data = JSON.parse(xhr.response);
                            if (Object.keys(data).length === 0) {
                                if(view == 'LS') {
                                    $("#alerts").html('<div class="alert alert-success" role="alert">Request processed.</div>');
                                    //Disable the controls
                                    $("#userIncome").prop("disabled", "true");
                                    $("#userIncomeBTN").prop("disabled", "true");
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-success" role="alert">Request processed.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'transaction.html');
                                    }).modal('show');            
                                }
                            } else {
                                if(view == 'LS') {
                                    $("#alerts").html('<div class="alert alert-warning" role="alert">Unable to process request.</div>');
                                    console.log("Unable to process request.");
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Unable to process request.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'transaction.html');
                                    }).modal('show');  
                                }
                            }
                        }
                    }
                    xhr.send(JSON.stringify(userData));
                }
            });
        };
    }
}

//Function used to check for user income every time he try to enter the
//new transaction. If there is no Income store for the given month in the database
//System will ask user to store the income first. In this case the system will redirect user
//to enter his income 
function checkForUserIncome() {
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.log("Error in getting session:" + err);
                $(location).attr('href', '401.html');
            }

            if (session.isValid()) {
                var AUTHORIZATION = session.getIdToken().getJwtToken();
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/checkuserincome/');
                xhr.setRequestHeader('Authorization', AUTHORIZATION);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        if (!Object.keys(data).length == 0) {
                            console.log("Data:" + data.isIncomeExist);
                            if (data.isIncomeExist == "false") {
                                $('#incomeModel').modal('show');
                                $('#incomeModel').on("hidden.bs.modal", function (e) {
                                    $(location).attr('href', 'addIncome.html');
                                }).modal('hide');
                            } else {
                                //Load the Category
                                console.log("Load Category");
                                var xhr1 = new XMLHttpRequest();
                                xhr1.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/getcategories/');
                                xhr1.setRequestHeader('Authorization', AUTHORIZATION);
                                xhr1.setRequestHeader('Content-Type', 'application/json');
                                xhr1.onreadystatechange = function () {
                                    if (xhr1.readyState == 4 && xhr1.status == 200) {
                                        var data = JSON.parse(xhr1.response);
                                        if (!Object.keys(data).length == 0) {
                                            var select = document.createElement("select");
                                            select.setAttribute("class", "form-control");
                                            select.setAttribute("id", "selCategory");

                                            $.each(data, function (key, value) {
                                                //console.log(data[key].CategoryName.S);
                                                var option = document.createElement("option");
                                                option.text = data[key].CategoryName.S;
                                                option.value = data[key].CategoryName.S;
                                                select.appendChild(option);
                                            })
                                            $('#selCategorySection').html(select);
                                        }
                                        else {
                                            console.log("Unable to load the categories.");
                                        }
                                    }
                                }
                                xhr1.send();
                            }
                        } else {
                            console.log("Unable to check the Income details.");
                        }
                    }
                }
                xhr.send();
            }
        });
    };
}

function loadSelect() {
    var select = document.createElement("select");
    select.setAttribute("class", "form-control");
    select.setAttribute("id", "selCategory");

    var option = document.createElement("option");
    option.text = "Fuel";
    option.value = "Fuel";
    select.appendChild(option);
    $('#selCategorySection').html(select);
}

//Function used to save the new transaction to DynamoDB
function addTransaction(view) {
    if (validateAddTransaction(view)) {
        var userTransactionData = {
            "dateTime": $('#tranDate').val(),
            "amount": $('#tranAmount').val(),
            "category": $('#selCategory option:selected').text(),
            "note": $('#tranNote').val()
        }

        var userIncomeData = {
            "userExpense": $('#tranAmount').val()
        }

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("Error in getting session:" + err);
                    return;
                }
                if (session.isValid()) {
                    var AUTHORIZATION = session.getIdToken().getJwtToken();
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/addexpense/');
                    xhr.setRequestHeader('Authorization', AUTHORIZATION);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var data = JSON.parse(xhr.response);
                            if (Object.keys(data).length === 0) {
                                console.log("Expense added to database.");
                                if(view == 'LS') {
                                    $("#alerts").html('<div class="alert alert-success" role="alert">Expense added to backend.</div>');
                                    //Disable all controls.
                                    $('#tranDate').prop("disabled", "true");
                                    $('#tranAmount').prop("disabled", "true");
                                    $('#selCategorySection').prop("disabled", "true");
                                    $('#tranNote').prop("disabled", "true");
                                    $('#addTransactionBTN').prop("disabled", "true");
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-success" role="alert">Expense added to backend.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'transaction.html');
                                    }).modal('show');  
                                }
                            } else {
                                console.log("Something wrong. Unable to save expense.");
                                if(view == 'LS') {
                                    $("#alerts").html('<div class="alert alert-danger" role="alert">Something wrong. Unable to save expense.</div>');
                                    //Disable all controls.
                                    $('#tranDate').prop("disabled", "true");
                                    $('#tranAmount').prop("disabled", "true");
                                    $('#selCategorySection').prop("disabled", "true");
                                    $('#tranNote').prop("disabled", "true");
                                    $('#addTransactionBTN').prop("disabled", "true");
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-danger" role="alert">Something wrong. Unable to save expense.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'transaction.html');
                                    }).modal('show');  
                                }
                            }
                            console.log(data);
                        }
                        // var res = JSON.parse(event.target.response);
                        // if(res.dataSaved) {
                        //     console.log(res.msg);
                        // }
                    }
                    xhr.send(JSON.stringify(userTransactionData));
                }
            });
        };
    }

    return false;
}

$('select').selectpicker({
    iconBase: 'FontAwesome'
});

//Show the Register Model Box
$("#form-register").on('submit', (evn) => {
    //$('#regConfirmModel').modal('show');
    return false;
});

//This function get called when user click on the Transaction menu or Rupee button on the 
//bottom of the mobile screen
function createNewTransaction() {
    $(location).attr('href', 'transaction.html');
}

//Function used to redirect the ListTransaction Mobile screen to Dashboard
$('#listTranCancel').on('click', (event) => {
    $(location).attr('href', 'dashboard.html');
});

//Function used to redirect the ListTrancation Monbile screen to NewTransaction
$('#listTranDone').on('click', (event) => {
    $(location).attr('href', 'transaction.html');
});


//Function used to open a datepicker on web
$("#tranDateWebId").datetimepicker({
    onChangeDateTime: function (dp, $input) {
        $('#tranDate').val($input.val());
    },
    closeOnDateSelect: true
});

//function is usedto redirect page to dashboard.html when click on cancel
$('#tranCancel').on('click', (event) => {
    $(location).attr('href', 'dashboard.html');
});

//Function is used to redirect page to dashboard.html when click on Category Cancel
$('#categoryCancel').on('click', (event) => {
    $(location).attr('href', 'dashboard.html');
});

//Function is used to redirect page to dashboard.htm. when click on Income Cancel
$('#incomeCancel').on('click', (event) => {
    $(location).attr('href', 'dashboard.html');
});

//Function is used to add the Income when click on Mobile device
$('#incomeDone').on('click', (event) => {
    addIncome('SM')
})

//Function is used to save the category when click using mobile device
$('#categoryDone').on('click', (event) => {
    addCategory("SM");
})

//Function is used to redirect page to dashboard.html when click on Done
$('#tranDone').on('click', (event) => {
    //$(location).attr('href', 'dashboard.html');
    addTransaction();
})

//Function used to edit/delete the expense by displaying the Model box
function editExpense(expId) {
    console.log("Edit Expense");
    $('#editDeleteModel').modal('show', (event) => {

    });
}

//Function get called when a new transaction addition request is initiated on mobile
//app by clicking on + icon
$('#addMobTransaction').on('click', (event) => {
    console.log("New Tansaction initiated");
    $(location).attr('href', 'transaction.html');
});

//Function used to open the icon model
$('#openIconModel').on('click', (event) => {
    $('#iconModel').modal('show');
})

//Function is used to assing the icon
function assignIcon(iconCode, iconName) {
    $('#iconAssignmentBTN').html("<span class='input-group-text'><i class='" + iconCode + "'></i></span>");
    $('#categoryName').val(iconName);
    $('#iconModel').modal('hide');
    $('#iconCode').val(iconCode);
}

//Function used to add the category in database
function addCategory(view) {
    if (validateCategory(view)) {
        var categoryData = {
            "CategoryName": $('#categoryName').val(),
            "CategoryCode": $('#iconCode').val()
        }
        
        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    console.log("Error in getting session:" + err);
                    return;
                }
                if (session.isValid()) {
                    var AUTHORIZATION = session.getIdToken().getJwtToken();
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/addcategory/');
                    xhr.setRequestHeader('Authorization', AUTHORIZATION);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            var data = JSON.parse(xhr.response);
                            if (Object.keys(data).length === 0) {
                                if(view == "LS") {
                                    $("#alerts").html('<div class="alert alert-success" role="alert">Category added into database.</div>');
                                    //Disable control
                                    $('#categoryName').prop("disabled", true);
                                    $('#categoryBTN').prop("disabled", true);
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-success" role="alert">Category added into database.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'category.html');
                                    }).modal('show');
                                }   
                            } else {
                                console.log("Unable to save category.")
                                if(view == "LS") {
                                    $("#alerts").html('<div class="alert alert-danger" role="alert">Unable to save category.</div>');
                                    //Disable control
                                    $('#categoryName').prop("disabled", true);
                                    $('#categoryBTN').prop("disabled", true);
                                } else {
                                    $('#alertModalBody').html('<div class="alert alert-danger" role="alert">Unable to save category.</div>');
                                    $('#alertModal').on("hidden.bs.modal", function (e) {
                                        $(location).attr('href', 'category.html');
                                    }).modal('show');
                                }
                            }
                        }
                    }
                    xhr.send(JSON.stringify(categoryData));
                }
            });
        };
    }
}

//Function used to load the report
function loadExpenseReport() {
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.log("Error in getting session:" + err);
                return;
            }
            if (session.isValid()) {
                var AUTHORIZATION = session.getIdToken().getJwtToken();
                //Load Income and Expense details for logged-in user
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/getincomeexpense/');
                xhr.setRequestHeader('Authorization', AUTHORIZATION);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        if (data.Count != 0) {
                            //console.log(JSON.parse(xhr.response).Items[0].userExpense.N);
                            $('#income').html(JSON.parse(xhr.response).Items[0].userIncome.N + ' <i class="fas fa-rupee-sign fa-xs"></i>');
                            $('#expense').html(JSON.parse(xhr.response).Items[0].userExpense.N + ' <i class="fas fa-rupee-sign fa-xs"></i>');
                        } else {
                            console.log("Something went wrong in getting Income/Expense data.")
                            $('#income').html('0' + ' <i class="fas fa-rupee-sign fa-xs"></i>');
                            $('#expense').html('0' + ' <i class="fas fa-rupee-sign fa-xs"></i>');
                        }
                    }
                }
                xhr.send();
            }
        });
    };
}

//Function used to get the list of transaction
function getTransactionList() {
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.log("Error in getting session:" + err);
                return;
            }
            if (session.isValid()) {
                var AUTHORIZATION = session.getIdToken().getJwtToken();
                //Load the transaction details for logged-in user
                var xhrT = new XMLHttpRequest();
                xhrT.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/gettransactionlist/');
                xhrT.setRequestHeader('Authorization', AUTHORIZATION);
                xhrT.setRequestHeader('Content-Type', 'application/json');
                xhrT.onreadystatechange = function () {
                    if (xhrT.readyState == 4 && xhrT.status == 200) {
                        var data = JSON.parse(xhrT.response);
                        if (Object.keys(data).length === 0) {
                            console.log("No Data");
                            $('#alerts').html('<div class="alert alert-warning" role="alert">No data available.</div>')
                        } else {
                            //Get the categories
                            var xhr1 = new XMLHttpRequest();
                            xhr1.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/getcategories/');
                            xhr1.setRequestHeader('Authorization', AUTHORIZATION);
                            xhr1.setRequestHeader('Content-Type', 'application/json');
                            xhr1.onreadystatechange = function () {
                                if (xhr1.readyState == 4 && xhr1.status == 200) {
                                    var categories = JSON.parse(xhr1.response);
                                    if (Object.keys(categories).length === 0) {
                                    } else {
                                        var categoryMap = new Map();
                                        $.each(categories, function (key, value) {
                                            categoryMap.set(categories[key].CategoryName.S, categories[key].CategoryCode.S);
                                        });
                                        loadDataToTable(data, categoryMap);
                                    }
                                }
                            }
                            xhr1.send();

                        }
                    }
                }
                xhrT.send();
            }
        });
    };
}

//Function used to load a data into a table
function loadDataToTable(data, categoryMap) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var table = $('#tranListTab');
    //Add the data rows.
    for (i = 0; i < data.Items.length; i++) {
        var date = new Date(data.Items[i].TransactionDateTime.S);

        var row = $(table[0].insertRow(-1));
        var td1 = $("<td scope='row'/>");
        var div = $("<div/>");
        var div1 = $("<div/>");
        div1.html('<i class="' + categoryMap.get(data.Items[i].Category.S) + '" aria-hidden="true"></i> ' + data.Items[i].Notes.S);
        var div2 = $('<div class="expense-date-info"/>');
        div2.html(days[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear());
        div.append(div1);
        div.append(div2);
        td1.append(div);

        var td2 = $("<td scope='row' class='td-expense'/>");
        td2.html(data.Items[i].Amount.S)

        row.append(td1);
        row.append(td2);
        table.append(row);
    }
}

//Function used to serach the transaction under transation list
function searchTran() {
    $('#searchIcon').hide();
    $('#searchSec').show();
}

//Function used to load the dashboard details
function processDashboard() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = new Date();
    var currMonth = date.getMonth();
    var currYear = date.getFullYear();

    //Set the Dashboard Date heading
    $('#dashboardDateHeading').html('<h5>' + months[currMonth] + ',' + currYear + '</h5>');

    //Load the income and expense details for the logged-in user
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.log("Error in getting session:" + err);
                return;
            }
            if (session.isValid()) {
                var AUTHORIZATION = session.getIdToken().getJwtToken();
                //Load Income and Expense details for logged-in user
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/getincomeexpense/');
                xhr.setRequestHeader('Authorization', AUTHORIZATION);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var data = JSON.parse(xhr.response);
                        if (Object.keys(data).length === 0) {
                            console.log("No Data");
                            $('#income').html('<i class="fas fa-rupee-sign fa-xs"></i> 0');
                            $('#expense').html('<i class="fas fa-rupee-sign fa-xs"></i> 0');
                            $('#balance').html('<i class="fas fa-rupee-sign fa-xs"></i> 0');
                        } else {

                            //console.log(JSON.parse(xhr.response).Items[0].userExpense.N);
                            $('#income').html('<i class="fas fa-rupee-sign fa-xs"></i> ' + JSON.parse(xhr.response).Items[0].userIncome.N) + '';
                            $('#expense').html('<i class="fas fa-rupee-sign fa-xs"></i> ' + JSON.parse(xhr.response).Items[0].userExpense.N) + '';

                            var income = parseInt(JSON.parse(xhr.response).Items[0].userIncome.N);
                            var expense = parseInt(JSON.parse(xhr.response).Items[0].userExpense.N);
                            var balance = income - expense;
                            $('#balance').html('<i class="fas fa-rupee-sign fa-xs"></i> ' + balance + '');

                            //Display and Categories the transaction on dashboard.
                            var xhrT = new XMLHttpRequest();
                            xhrT.open('GET', 'https://jt2afva79l.execute-api.ap-south-1.amazonaws.com/Dev/gettransactionlist/');
                            xhrT.setRequestHeader('Authorization', AUTHORIZATION);
                            xhrT.setRequestHeader('Content-Type', 'application/json');
                            xhrT.onreadystatechange = function () {
                                if (xhrT.readyState == 4 && xhrT.status == 200) {
                                    var data = JSON.parse(xhrT.response);
                                    if (Object.keys(data).length === 0) {
                                        console.log("No Data");
                                    } else {
                                        var categoryMap = new Map();
                                        for (i = 0; i < data.Items.length; i++) {
                                            var duplicateCat = categoryMap.get(data.Items[i].Category.S);
                                            if (duplicateCat) {
                                                var originalAmt = parseInt(duplicateCat);
                                                var newAmt = parseInt(data.Items[i].Amount.S);
                                                var totalAmt = originalAmt + newAmt;
                                                categoryMap.set(data.Items[i].Category.S, totalAmt);
                                            } else {
                                                categoryMap.set(data.Items[i].Category.S, data.Items[i].Amount.S);
                                            }
                                        }

                                        categoryMap.forEach(function (value, key) {
                                            $('#expenseList').append(
                                                $('<div>').prop({
                                                    className: 'row'
                                                }).append(
                                                    $('<div>').prop({
                                                        className: 'col-4 offset-2 col-sm-3 offset-sm-4  pl-sm-5',
                                                        innerHTML: key
                                                    })
                                                )
                                                    .append(
                                                        $('<div>').prop({
                                                            className: '',
                                                            innerHTML: '<i class="fas fa-rupee-sign fa-xs"></i> ' + value
                                                        })
                                                    )
                                            );
                                        })
                                    }

                                }
                            }
                            xhrT.send();
                        }
                    }
                }
                xhr.send();
            }
        });
    };
}

//Function used to validate the login form
function validateLoginForm() {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if ($('#inputEmail').val() == "") {
        console.log("Email is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Email is required.</div>')
        return false;
    } else if (!re.test(String($('#inputEmail').val()).toLocaleLowerCase())) {
        console.log("Invalid Email");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Invalid email address.</div>')
        return false;
    } else if ($('#inputPassword').val() == "") {
        console.log("Password is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Password is required.</div>')
        return false;
    }
    return true;
}

//Function used to validate the new user registration form
function validateNewUserRegistrationForm() {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if ($('#firstName').val() == "") {
        console.log("First Name is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">First Name is required.</div>')
        return false;
    } else if ($('#lastName').val() == "") {
        console.log("Last Name is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Last Name is required.</div>')
        return false;
    } else if ($('#emailId').val() == "") {
        console.log("Email id is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Email Id is required.</div>')
        return false;
    } else if (!re.test(String($('#emailId').val()).toLocaleLowerCase())) {
        console.log("Invalid Email");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Invalid email address.</div>')
        return false;
    } else if ($('#myPassword').val() == "") {
        console.log("Password is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Password is required.</div>')
        return false;
    } else if ($('#myConfirmPassword').val() == "") {
        console.log("Confirm password is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Confirm password is required.</div>')
        return false;
    } else if ($('#myConfirmPassword').val() != $('#myPassword').val()) {
        console.log("Password and Confirm Password should match");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Password and Confirm Password should match.</div>')
        return false;
    }
    return true;
}

//Function used to validate the userRegistration form with Code
function validateVerificationCodeForm() {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if ($('#inputEmail').val() == "") {
        console.log("Email id is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Email Id is required.</div>')
        return false;
    } else if (!re.test(String($('#inputEmail').val()).toLocaleLowerCase())) {
        console.log("Invalid Email");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Invalid email address.</div>')
        return false;
    } else if ($('#inputPassword').val() == "") {
        console.log("Password is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Password is required.</div>')
        return false;
    } else if ($('#inputRegCode').val() == "") {
        console.log("Registration Code is required");
        $('#alerts').html('<div class="alert alert-danger" role="alert">Registration Code is required.</div>')
        return false;
    }

    return true;
}

//Function used to validate Add New Income
function validateAddUserIncome(view) {
    if ($('#userIncome').val() == "") {
        if(view == 'LS') {
            console.log("Please enter user Income for curent month.");
            $('#alerts').html('<div class="alert alert-danger" role="alert">Please enter your Income for curent month.</div>')
            return false;
        } else {
            $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Please enter your Income for curent month.</div>');
            $('#alertModal').modal('show');  
            return false;
        }
    }
    return true;
}

//Function used to validate the AddTransaction
function validateAddTransaction(view) {
    if ($('#tranDate').val() == "") {
        if(view == 'LS') {
            console.log("Please select the date.");
            $('#alerts').html('<div class="alert alert-danger" role="alert">Please select date for expense.</div>')
            return false;
        } else {
            $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Please select date for expense.</div>');
            $('#alertModal').modal('show');  
            return false;
        }
    } else if ($('#tranAmount').val() == "") {
        if(view == 'LS') {
            console.log("Please enter expense amount.");
            $('#alerts').html('<div class="alert alert-danger" role="alert">Please enter expense amount.</div>')
            return false;
        } else {
            $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Please enter expense amount.</div>');
            $('#alertModal').modal('show');  
            return false;
        }
    } else if ($('#tranNote').val() == "") {
        if(view == 'LS') {
            console.log("Please enter expense note.");
            $('#alerts').html('<div class="alert alert-danger" role="alert">Please enter expense note.</div>')
            return false;
        } else {
            $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Please enter expense note.</div>');
            $('#alertModal').modal('show');  
            return false;
        }
    }
    return true;
}

//Function used to validate category
function validateCategory(view) {
    if ($('#categoryName').val() == "") {
        if(view == 'LS') {
            console.log("Please select category.");
            $('#alerts').html('<div class="alert alert-danger" role="alert">Please select category.</div>')
            return false;
        } else {
            $('#alertModalBody').html('<div class="alert alert-warning" role="alert">Please select category.</div>');
            $('#alertModal').modal('show');
            return false;
        }
    }
    return true;
}

//Function used to allow to enter only numbers
function isNumberKey(txt, evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46) {
        //Check if the text already contains the . character
        if (txt.value.indexOf('.') === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (charCode > 31 &&
            (charCode < 48 || charCode > 57))
            return false;
    }
    return true;
}