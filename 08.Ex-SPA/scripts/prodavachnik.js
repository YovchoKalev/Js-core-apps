function startApp() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_HJf9xRcMx";
    const kinveyAppSecret = "c0138adfe9f74362976b1020b5902e90";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };


    sessionStorage.clear(); // Clear user auth data
    showHideMenuLinks();
    showView('viewHome');

    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(listAds);
    $("#linkCreateAd").click(showCreateAdView);
    $("#linkLogout").click(logoutUser);
    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateAd").click(createAdd);
    $("#buttonEditAd").click(editAd);
    // Bind the info / error boxes: hide on click
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
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();

        } else {
            // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
        }
    }
    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }
    function showHomeView() {
        showView('viewHome');
    }
    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }
    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }
    function showCreateAdView() {
        $('#formCreateAd').trigger('reset');
        showView('viewCreateAd');
    }
    function loginUser() {
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
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
            listAds();
            showInfo('Login successful.');
        }
    }
    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
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
            listAds();
            showInfo('User registration successful.');
        }

    }
    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }
    function listAds() {
        $('#ads').empty();
        showView('viewAds');

        const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ads";
        $.ajax({
            method: "GET",
            url: kinveyBooksUrl,
            headers: getKinveyUserAuthHeaders(),
            success: loadAdsSuccess,
            error: handleAjaxError
        });

        function loadAdsSuccess(ads) {
            showInfo('Ads loaded.');
            if (ads.length == 0) {
                $('#ads').text('No advertisements available.');
            } else {
                let adsTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th>',
                        '<th>Description</th>',
                        '<th>Publisher</th>',
                        '<th>Price</th>',
                        '<th>Date Published</th>',
                        '<th>Actions</th>'));
                for (let ad of ads) {
                    let links = [];
                    if(ad._id==='undefined'){
                        deleteAd(ad);
                        continue;
                    }
                    if (ad._acl.creator == sessionStorage['userId']) {
                        let deleteLink = $('<a href="#">[Delete]</a>')
                                .click(function () {
                                deleteAd(ad)
                            });
                        let editLink = $('<a href="#">[Edit]</a>')
                            .click(function () {
                                loadAdForEdit(ad)
                            });
                        links = [deleteLink, ' ', editLink];
                    }
                    adsTable.append($('<tr>').append(
                        $('<td>').text(ad.Title),
                        $('<td>').text(ad.Description),
                        $('<td>').text(ad.Publisher),
                        $('<td>').text(ad.Price),
                        $('<td>').text(ad.Date),
                        $('<td>').append(links)
                    ));
                }
                $('#ads').append(adsTable);
            }
        }
    }

    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " +
            sessionStorage.getItem('authToken'),
        };
    }
    function createAdd() {
        let adData = JSON.stringify({
            Publisher: sessionStorage.getItem('username'),
            Title: $('#formCreateAd input[name=title]').val(),
            Description: $('#formCreateAd textarea[name=description]').val(),
            Date: $('#formCreateAd input[name=datePublished]').val(),
            Price: $('#formCreateAd input[name=price]').val()
        });
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ads",
            headers: getKinveyUserAuthHeaders(),
            data: adData,
            contentType: "application/json",
            dataType: 'json',
            success: createAdSuccess,
            error: handleAjaxError
        });
        function createAdSuccess(response) {
            listAds();
            showInfo('Ad created.');
        }
    }
    function loadAdForEdit(ad) {
        $.ajax({
            method: "GET",
            url: kinveyAdUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/ads/" + ad._id,
            headers: getKinveyUserAuthHeaders(),
            success: loadAdForEditSuccess,
            error: handleAjaxError
        });
        function loadAdForEditSuccess(ad) {
            $('#formEditAd input[name=id]').val(ad._id);
            $('#formEditAd input[name=title]').val(ad.Title);
            $('#formEditAd textarea[name=description]').val(ad.Description);
            $('#formEditAd input[name=datePublished]').val(ad.Date);
            $('#formEditAd input[name=price]').val(ad.Price);
            showView('viewEditAd');
        }
    }
    function editAd() {
        const kinveyBookUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey +
            "/ads/" + $('#formEditAd input[name=id]').val();
        let adData = JSON.stringify({
            Title: $('#formEditAd input[name=title]').val(),
            Description: $('#formEditAd textarea[name=description]').val().trim(),
            Publisher: sessionStorage.getItem('username'),
            Date: $('#formEditAd input[name=datePublished]').val(),
            Price: Number($('#formEditAd input[name=price]').val())
        });

        $.ajax({
            method: "PUT",
            url: kinveyBookUrl,
            headers: getKinveyUserAuthHeaders(),
            data: adData,
            contentType: "application/json",
            dataType: 'json',
            success: editAdSuccess,
            error: handleAjaxError
        });
        function editAdSuccess(response) {
            listAds();
            showInfo('Ad edited.');
        }
    }
    function deleteAd(ad) {
        $.ajax({
            method: "DELETE",
            url: kinveyAdUrl = kinveyBaseUrl + "appdata/" +
                kinveyAppKey + "/ads/" + ad._id,
            headers: getKinveyUserAuthHeaders(),
            success: deleteAdSuccess,
            error: handleAjaxError
        });
        function deleteAdSuccess(response) {
            listAds();
            showInfo('Advert deleted.');
        }
    }
    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);

/*
        $('#loggedInUser').text(
            "Welcome, " + username + "!");
*/
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
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

}
