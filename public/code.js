// login stuff
var userName;
var loginScreen = document.getElementById('login');
loginScreen.children[0].addEventListener('keydown', function (evt) {
    if (evt.key == 'Enter') {
        evt.preventDefault();
        if (this.value != '') {
            userName = this.value;
            addUser(userName);
            listUsers();
            listMessages();
            setInterval(listUsers, 10000);
            setInterval(listMessages, 1000);
            document.body.removeChild(loginScreen);
        }
    }
});

// functionality stuff
window.addEventListener('beforeunload', deleteUser);


var messageForm = document.getElementById('message-input');
var sendButton = document.getElementById('send-button');
var usersList = document.getElementById('users-window');
var chatWindow = document.getElementById('chat');

messageForm.addEventListener('keydown', function (evt) {
    if (evt.key == 'Enter') {
        evt.preventDefault();
        if (this.value != '') {
            sendText(this.value);
            listMessages();
        }
        this.value = '';
    }
});

sendButton.addEventListener('click', function (evt) {
    messageForm.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
});





// server stuff
var listUsersRequest = new XMLHttpRequest();
listUsersRequest.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var userList = this.response;
        usersList.innerHTML = '';
        for (user of userList) {
            usersList.innerHTML += user.name + '<br>';
        }
    }
}

function listUsers () {
    listUsersRequest.open('GET', '/users');
    listUsersRequest.responseType = 'json';
    listUsersRequest.send();
}

var listMessagesRequest = new XMLHttpRequest();
listMessagesRequest.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var messages = this.response;
        chatWindow.innerHTML = '';
        for ( m of messages) {
            chatWindow.innerHTML += `${m.user}: ${m.message}<br>`;
        }
    }
}

function listMessages () {
    listMessagesRequest.open('GET', '/messages');
    listMessagesRequest.responseType = 'json';
    listMessagesRequest.send();
}

function sendText (string) {
    var messageObject = {
        "user": userName,
        "message": string
    }
    var request = new XMLHttpRequest();
    
    request.open('POST', '/messages');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(messageObject));
}


function addUser (name) {
    var request = new XMLHttpRequest();

    request.open('POST', '/users');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        "name": name
    }));
}

function deleteUser () {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            var deleteRequest = new XMLHttpRequest();
            var userObject = this.response[0];

            if (userObject != null) {
                deleteRequest.open('DELETE', `/users/${userObject.id}`)
                deleteRequest.send();
            }
        }
    }

    request.open('GET', `/users?name=${userName}`);
    request.responseType = 'json';
    request.send();
}