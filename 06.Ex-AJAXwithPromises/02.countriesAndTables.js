$(document).ready(function() {
    const kinveyAppId = "kid_H1A-r2Vze";
    const serviceUrl = "https://baas.kinvey.com/appdata/" + kinveyAppId;
    const kinveyUsername = "guest";
    const kinveyPassword = "guest";
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {"Authorization": "Basic " + base64auth};
    $("#btnLoadCountries").click(loadCountries);
    $("#btnViewTowns").click(loadTowns);
    $("#btnAddCountry").click(addCountry);
    $("#btnDeleteCountry").click(deleteCountry);
    $("#btnEditCountry").click(editCountry);

    function editCountry() {
        let selectedCountryId = $('#countries').val();
        let country=$("#editCountry");
        let JSONdata = JSON.stringify({
            Country:country.val()
        });
        let request = {
            method: 'PUT',
            url: serviceUrl + '/Countries/' + selectedCountryId,
            headers: authHeaders,
            data: JSONdata,
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request)
            .then(loadTowns)
            .catch(displayError);
        country.val('');
    }
    function addCountry() {
        let newCountry= $('#addCountry');
        if (!newCountry.val())return;
        let newCommentJSON = JSON.stringify({
            Country: newCountry.val()
        });
        let request = {
            url: serviceUrl + '/Countries',
            headers: authHeaders,
            data: newCommentJSON,
            contentType: "application/json",
            dataType: 'json'
        };
        $.post(request)
            .then(loadTowns)
            .catch(displayError);
        newCountry.val('');
    }
    function loadCountries() {
        let request = {
            url: serviceUrl + '/Countries',
            headers: authHeaders
        };
        $.get(request).then(fillSelector).catch(displayError);
        $("#btnEditCountry").hide();
        $("#countries").show();
        $("#btnDeleteCountry").hide();
        $("#editCountry").hide();
    }
    function fillSelector(countries) {
        let countrySelector = $("#countries");
        countrySelector .empty();
        for (let country of countries) {
            countrySelector .append($("<option>")
                .text(country.Country)
                .val(country._id));
        }

    }
    function loadTowns() {
        let selectedCountryId = $('#countries').val();
        if (!selectedCountryId)return;
        let countryRequest = $.ajax({
            url: serviceUrl + `/Countries/` + selectedCountryId,
            headers: authHeaders
        });
        let townsRequest = $.ajax({
            url: serviceUrl + `/Towns/?query={"country_id":"${selectedCountryId}"}`,
            headers: authHeaders
        });
        Promise.all([countryRequest,townsRequest]).then(displayTowns).catch(displayError);
    }
    function displayTowns([country,towns]) {
        $(document.body).find('.new-town').remove();
        $(document.body).find('.edit-town').remove();
        $(document.body).find('.add-town').remove();
        let countryName = $('#countryName');
        $("#towns").text(country.Country).show();
        $("#countries").hide();
        let townsList = $('#townsList');
        townsList.empty();
        if (towns.length == 0) {
            townsList.append($("<li>").text('No towns found.'))
        }
        for (let town of towns) {
            // countryName.empty();
            // countryName.text(town.country_id).show();
            let li = $("<li>").text(town.Towns).val(town._id).append(" ")
                .append($("<button>Delete</button>")
                    .click(function () {
                        deleteTown(town._id);
                    }))
                .append(" ")
                .append($("<button>Edit</button>")
                    .click(function () {
                        editTown(town._id);
                    }));
            townsList.append(li)
        }
        $("#btnEditCountry").show();
        $("#btnDeleteCountry").show();
        $("#editCountry").show();
        $(document.body).append($("<input>").addClass('edit-town').attr('placeholder','Edit town name'));
        $(document.body).append($("<input>").addClass('new-town').attr('placeholder','Add new town'))
            .append(" ")
            .append($("<button class='add-town'>").text('Add town'));
        $('.add-town').click(addTown);
    }
    function editTown(townId) {
        let selectedCountryId = $('#countries').val();
        let editedTown=$(".edit-town");
        if (!editedTown.val())return;
        let JSONdata = JSON.stringify({
            Towns: editedTown.val(),
            country_id: selectedCountryId
        });
        let request = {
            method: 'PUT',
            url: serviceUrl + '/Towns/' + townId,
            headers: authHeaders,
            data: JSONdata,
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request)
            .then(loadTowns)
            .catch(displayError);
        editedTown.val('');
    }
    function addTown() {
        let newTown = $('.new-town');
        if (!newTown.val())return;

        let currentCountry = $('#countries').val();
        let newTownJSON = JSON.stringify({
            Towns: newTown.val(),
            country_id: currentCountry
        });
        let request = {
            url: serviceUrl + '/Towns',
            headers: authHeaders,
            data: newTownJSON,
            contentType: "application/json",
            dataType: 'json'
        };
        $.post(request)
            .then(loadTowns)
            .catch(displayError);
        newTown.val('');
    }
    function deleteCountry() {
        let selectedCountryId = $('#countries').val();
        let request = {
            method: 'DELETE',
            url: serviceUrl + '/Countries/' + selectedCountryId,
            headers: authHeaders
        };
        $.ajax(request)
            .then(function () {
                location.reload();
                loadTowns();
            })
            .catch(displayError);
    }
    function deleteTown(townId) {
        let request = {
            method: 'DELETE',
            url: serviceUrl + '/Towns/' + townId,
            headers: authHeaders
        };
        $.ajax(request)
            .then(loadTowns)
            .catch(displayError);

    }
    function displayError(error) {
        let errDiv = $("<div>").text(`Error ${error.status} : (${error.statusText})`);
        $(document.body).prepend(errDiv);
        setTimeout(function () {
            $(errDiv).fadeOut(function () {
                $(errDiv).remove();
            });
        }, 3000);
    }
});