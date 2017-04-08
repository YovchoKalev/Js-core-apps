function startApp() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_HkdVgFqQx";
    const kinveyAppSecret = "51bef7efbbb8427ebc632e2d253e4a41";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    sessionStorage.clear(); // Clear user auth data
    showHideMenuLinks();
    if(sessionStorage.getItem('authToken')) {
        $('#spanMenuLoggedInUser').text('Welcome, ' + sessionStorage.getItem('name') + '!');
        showUserHomeView()
    }else {
        $('#spanMenuLoggedInUser').empty();
        showAppHomeView();
    }
    $("#linkMenuAppHome").click(showAppHomeView);
    $("#linkMenuLogin").click(showLoginView);
    $("#linkMenuRegister").click(showRegisterView);

    $("#linkMenuUserHome").click(showUserHomeView);
    $("#linkMenuMyMessages").click(listMessages);
    $("#linkUserHomeMyMessages").click(listMessages);
    $("#linkMenuSendMessage").click(sendMessageView);
    $("#linkUserHomeSendMessage").click(sendMessageView);
    $("#linkMenuArchiveSent").click(archiveSentView);
    $("#linkUserHomeArchiveSent").click(archiveSentView);
    $("#linkMenuLogout").click(logoutUser);

    // Bind the form submit buttons
    $(`#formLogin input[type="submit"]`).click(loginUser);
    $(`#formRegister input[type="submit"]`).click(registerUser);
    $(`#formSendMessage input[type="submit"]`).click(sendMessage);

    $("#infoBox, #errorBox").click(function () {
        $(this).fadeOut();
    });
// Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show()
        },
        ajaxStop: function () {
            $("#loadingBox").hide()
        }
    });
    function showHideMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            $("#linkMenuAppHome").hide();
            $("#linkMenuLogin").hide();
            $("#linkMenuRegister").hide();
            $("#linkMenuUserHome").show();
            $("#linkMenuMyMessages").show();
            $("#linkMenuSendMessage").show();
            $("#linkMenuArchiveSent").show();
            $("#linkMenuLogout").show();
        } else {
            $("#linkMenuAppHome").show();
            $("#linkMenuLogin").show();
            $("#linkMenuRegister").show();
            $("#linkMenuUserHome").hide();
            $("#linkMenuMyMessages").hide();
            $("#linkMenuSendMessage").hide();
            $("#linkMenuArchiveSent").hide();
            $("#linkMenuLogout").hide();

            // No logged in user
        }
    }
    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }
    function showAppHomeView() {
        showView('viewAppHome');
    }
    function showUserHomeView() {
        $('#viewUserHomeHeading').text('Welcome, ' + sessionStorage.getItem('name') + '!');
        showView('viewUserHome');
        loadUsers();
    }
    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }
    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }
    function sendMessageView() {
        showView('viewSendMessage');
    }
    function archiveSentView() {
        const getSentMsgsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + `/messages?query={"sender_username":"${sessionStorage.getItem('username')}"}`;
        $('#sentMessages').empty();
        let table = $('<table>').append(`<thead>
                        <tr>
                            <th>To</th>
                            <th>Message</th>
                            <th>Date Sent</th>
                            <th>Actions</th>
                        </tr>
                    </thead>`);
        $.ajax({
            method: "GET",
            url: getSentMsgsUrl,
            headers: getKinveyUserAuthHeaders(),
            success: fillSentTable,
            error: handleAjaxError
        });
        function fillSentTable(messages) {
            if (messages.length == 0) {
                $('#sentMessages').empty();
                $('#sentMessages').text('No messages found.');
            }
            else {
                let tbody = $('<tbody>');
                for (let msg of messages) {
                    let delBtn = $('<button>Delete</button>').click(function () {
                        deleteMsg(msg, this)
                    });
                    let td = $('<td>');
                    td.append(delBtn);


                    table.append($('<tbody>')
                        .append($(`<td>`).text(msg.recipient_username))
                        .append($(`<td>`).text(msg.text))
                        .append($(`<td>`).text(formatDate(msg._kmd.ect)))
                        .append(td));
                }
                $('#sentMessages').append(table);
            }
        }
        showView('viewArchiveSent');
        showInfo('Archives loaded.');

    }
    function loginUser(e) {
        e.preventDefault();
        let userData = {
            username: $('#loginUsername').val(),
            password: $('#loginPasswd').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: handleAjaxError
        });
        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            $('#spanMenuLoggedInUser').text("Welcome, " + sessionStorage.getItem('name') + '!');
            showUserHomeView();
            showInfo('Login successful.');
        }
    }
    function registerUser(e) {
        e.preventDefault();
        let userData = {
            username: $('#registerUsername').val(),
            password: $('#registerPasswd').val(),
            name: $('#registerName').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: registerSuccess,
            error: handleAjaxError
        });
        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showUserHomeView();
            showInfo('User registration successful.');
        }
    }
    function logoutUser() {
        sessionStorage.clear();
        $('#spanMenuLoggedInUser').empty();
        showHideMenuLinks();
        showView('viewAppHome');
        showInfo('Logout successful.');
    }
    function listMessages(){
        $('#myMessages').empty();
        const getMyMsgsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + `/messages?query={"recipient_username":"${sessionStorage.getItem('username')}"}`;
        let table = $('<table>').append(`<thead>
                    <tr>
                        <th>From</th>
                        <th>Message</th>
                        <th>Date Received</th>
                    </tr>
                    </thead>`);
        $.ajax({
            method: "GET",
            url: getMyMsgsUrl,
            headers: getKinveyUserAuthHeaders(),
            success: fillTable,
            error: handleAjaxError
        });
        function fillTable(messages) {
            if (messages.length == 0) {
                $('#myMessages').empty();
                $('#myMessages').text('No messages found.')
            }
            else {
                let tbody = $('<tbody>');
                for (let msg of messages) {
                    tbody.append($('<tr>')
                        .append($(`<td>`).text(formatSender(msg.sender_name, msg.sender_username)))
                        .append($(`<td>`).text(msg.text))
                        .append($(`<td>`).text(formatDate(msg._kmd.ect))));
                }
                table.append(tbody);
                $('#myMessages').append(table);
            }
        }
        showView('viewMyMessages');
    }
    function loadUsers() {
        let listUsersUrl = kinveyBaseUrl  + "user/" + kinveyAppKey;
        $('#msgRecipientUsername').empty();
        $.ajax({
            method: 'GET',
            url: listUsersUrl,
            headers:getKinveyUserAuthHeaders() ,
            success: displayUsersInDropdown,
            error: handleAjaxError
        });
        function displayUsersInDropdown(users) {
            for (let user of users) {
                $('#msgRecipientUsername').append($('<option>')
                    .text(formatSender(user.name, user.username))
                    .val(user.username));
            }
        }

    }
    function sendMessage(e) {
        e.preventDefault();
        const sendMsgUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/messages";
        let msgData = {
            sender_username: sessionStorage.getItem('username'),
            sender_name: sessionStorage.getItem('name'),
            recipient_username: $("#msgRecipientUsername").val() ,
            text: $('#msgText').val()
        };
        $.ajax({
            method: "POST",
            url: sendMsgUrl,
            headers: getKinveyUserAuthHeaders(),
            data: msgData,
            success: sentSuccess,
            error: handleAjaxError
        });
        function sentSuccess() {
            showInfo('Message sent!');
            $('#msgText').empty();
            archiveSentView()
        }
    }
    function deleteMsg(msg,btn) {
        let delUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/messages"+`/${msg._id}`;
        $.ajax({
            method: "DELETE",
            url: delUrl,
            headers: getKinveyUserAuthHeaders(),
            success: deleteMsgSuccess,
            error: handleAjaxError
        });
        function deleteMsgSuccess() {
            $(btn).parent().parent().remove();
            showInfo('Message deleted.');
        }
    }
    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }
    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }
    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " +
            sessionStorage.getItem('authToken'),
        };
    }
    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        let name = userInfo.name;
        sessionStorage.setItem('name', name);
        $('#loggedInUser').text(
            "Welcome, " + username + "!");
    }
    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }
    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000);
    }
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

}