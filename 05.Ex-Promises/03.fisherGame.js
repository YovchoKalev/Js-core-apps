function attachEvents() {
    const kinveyAppId = "kid_H1lEKCnWl";
    const serviceUrl = "https://baas.kinvey.com/appdata/" + kinveyAppId + "/biggestCatches";
    const kinveyUsername = "martin";
    const kinveyPassword = "m";
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {"Authorization": "Basic " + base64auth};

    $('.load').click(loadCatch);
    $('.add').click(createCatch);
    $('.delete').click(deleteCatch);
    $('.update').click(updateCatch);

    function createCatch() {
        let angler = $("#addForm .angler");
        let weight = $("#addForm .weight");
        let species = $("#addForm .species");
        let location = $("#addForm .location");
        let bait = $("#addForm .bait");
        let captureTime = $("#addForm .captureTime");
        let newCatchJSON = {
            angler: angler.val(),
            weight: Number(weight.val()),
            species: species.val(),
            location: location.val(),
            bait: bait.val(),
            captureTime: Number(captureTime.val())
        };
        // alert(newCatchJSON);
        let request = {
            method: "POST",
            url: serviceUrl,
            headers: authHeaders,
            data: JSON.stringify(newCatchJSON),
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request)
            .then(loadCatch)
            .catch(displayError);
        angler.val('');
        weight.val('');
        species.val('');
        location.val('');
        bait.val('');
        captureTime.val('');
    }
    function loadCatch() {
        let request = {
            url: serviceUrl,
            headers: authHeaders
        };
        $.get(request)
            .then(displayCatches)
            .catch(displayError);
    }
    function displayCatches(catches) {
        let catchesDiv = $("#catches");
        catchesDiv.empty();
        for (let curCatch of catches) {
            fillForm(curCatch);
            $('.delete').click(deleteCatch);
            $('.update').click(updateCatch);
        }

    }
    function fillForm(curCatch) {
        let catchesDiv = $("#catches");
        let angler = curCatch.angler;
        let weight = curCatch.weight;
        let species = curCatch.species;
        let location = curCatch.location;
        let bait = curCatch.bait;
        let captureTime = curCatch.captureTime;
        catchesDiv
            .append($("<div>")
                .addClass('catch')
                .attr('data-id', curCatch._id)
                .append(`<label>Angler</label>`)
                .append(`<input type="text" class="angler" value="${angler}"/>`)
                .append(`<label>Weight</label>`)
                .append(`<input type="number" class="weight" value="${weight}"/>`)
                .append(`<label>Species</label>`)
                .append(`<input type="text" class="species" value="${species}"/>`)
                .append(`<label>Location</label>`)
                .append(`<input type="html" class="location" value="${location}"/>`)
                .append(`<label>Bait</label>`)
                .append(`<input type="text" class="bait" value="${bait}"/>`)
                .append(`<label>Capture Time</label>`)
                .append(`<input type="number" class="captureTime" value="${captureTime}"/>`)
                .append(`<button class="update">Update</button>`)
                .append(`<button class="delete">Delete</button>`));
    }
    function deleteCatch() {
        let currentId=$(this).parent().attr('data-id');
        let request = {
            method: 'DELETE',
            url: serviceUrl + '/' + currentId,
            headers: authHeaders
        };
        $.ajax(request)
            .then(loadCatch)
            .catch(displayError);
    }
    function updateCatch() {
        let currentDiv = $(this).parent();
        let currentId=currentDiv.attr('data-id');
        let updateCatchJSON = {
            angler: currentDiv.find('.angler').val(),
            weight: Number(currentDiv.find('.weight').val()),
            species: currentDiv.find('.species').val(),
            location: currentDiv.find('.location').val(),
            bait: currentDiv.find('.bait').val(),
            captureTime: Number(currentDiv.find('.captureTime').val())
        };
        let request = {
            method: "PUT",
            url: serviceUrl + '/' + currentId,
            headers: authHeaders,
            data: JSON.stringify(updateCatchJSON),
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request)
            .then(loadCatch)
            .catch(displayError);
    }

    function displayError(error) {
        let errDiv = $("<div>").text(`Error ${error.status} : (${error.statusText})`);
        $(errDiv).insertBefore(document.body);
        setTimeout(function () {
            $(errDiv).fadeOut(function () {
                $(errDiv).remove();
            });
        }, 3000);
    }
}