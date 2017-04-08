function attachEvents() {
    const urlAppdata = "https://baas.kinvey.com/appdata/kid_BJ_Ke8hZg/venues/";
    const kinveyUsername = "guest";
    const kinveyPassword = "pass";
    const urlRpc = 'https://baas.kinvey.com/rpc/kid_BJ_Ke8hZg/custom/calendar?query=';
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {"Authorization": "Basic " + base64auth};
    $("#getVenues").click(getVenues);
    function getVenues() {
        let date = $('#venueDate').val();
        if (!date)return;
        $.post({
            url: urlRpc + date,
            headers: authHeaders
        }).then(loadEverything)
            .catch(displayError);
    }
    function loadEverything(object) {
        let mainDiv = $("#venue-info");
        mainDiv.empty();
        for (let venue of object) {
            load(venue)
        }
        function load(id) {
            $.get({
                url: urlAppdata + id,
                headers: authHeaders
            }).then(displayVenues)
                .catch(displayError);
        }
    }
    function displayVenues(venue) {
        let id = venue._id;
        let mainDiv = $("#venue-info");
        let div = $("<div>").addClass('venue').attr('id', venue._id);
        let span = $(`<span>`)
            .addClass("venue-name")
            .append(`<input class="info" type="button" value="More info" >`)
            .append(venue.name);
        div.append(span);
        let hiddenDiv = $('<div>').addClass("venue-details").attr('style', "display: none");
        let table = $("<table>")
            .append(`<tr><th>Ticket Price</th><th>Quantity</th><th></th></tr>`)
            .append($('<tr>')
                .append(`<td class="venue-price">${venue.price} lv</td>`)
                .append($(`<td>`)
                    .append($('<select>').addClass("quantity")
                        .append(`<option value="1">1</option>`)
                        .append(`<option value="2">2</option>`)
                        .append(`<option value="3">3</option>`)
                        .append(`<option value="4">4</option>`)
                        .append(`<option value="5">5</option>`)))
                .append(`<td><input class="purchase" type="button" value="Purchase"></td>`));
        hiddenDiv.append(table);
        hiddenDiv.append(`<span class="head">Venue description:</span>`)
            .append(`<p class="description">${venue.description}</p>`)
            .append(`<p class="description">Starting time: ${venue.startingHour}</p>`);
        div.append(hiddenDiv);
        mainDiv.append(div);

        let curVenue = $('div#' + id + '.venue');
        curVenue.children().children('.info').click(function () {
            $('div#' + id + '.venue').children('.venue-details').show()
        });
        $('input.purchase').click(function () {
            let mainDiv = $("#venue-info");
            let quantity=$(this).parent().parent().find('select').val();
            let totalPrice=Number(venue.price)*Number(quantity);

            let span = $(`<span>`)
                .addClass("head")
                .text(`Confirm purchase`);
            let purchaseInfo=$('<div>').addClass('purchase-info')
                .append(`<span>${venue.name}</span>`)
                .append(`<span>${quantity} x ${Math.round(venue.price).toFixed(2)}</span>`)
                .append(`<span>Total: ${Math.round(totalPrice).toFixed(2)} lv</span>`)
                .append(`<input type="button" value="Confirm">`);
            mainDiv.empty();
            mainDiv.append(span).append(purchaseInfo);
            purchaseInfo.find('input').click(function () {
                mainDiv.empty();
                // mainDiv.append('You may print this page as your ticket.');
                let request={
                    url:'https://baas.kinvey.com/rpc/kid_BJ_Ke8hZg/custom/purchase?venue='+venue._id+'&qty='+quantity,
                    headers:authHeaders
                };
                $.post(request).then(displayTicket).catch(displayError);

                function displayTicket(arr) {
                    let mainDiv = $("#venue-info");
                    mainDiv.prepend('You may print this page as your ticket.');
                    mainDiv.append(arr.html);
                }
            });
        });
    }
    function displayError(err) {
        console.log(err);
    }
}
