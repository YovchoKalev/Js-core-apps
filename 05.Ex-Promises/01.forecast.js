function attachEvents() {
    const locationsUrl = "https://judgetests.firebaseio.com/locations/.json";
    const forecastTodayUrl = "https://judgetests.firebaseio.com/forecast/today/";
    const forecastUpcomingUrl = "https://judgetests.firebaseio.com/forecast/upcoming/";
    let submitBtn = $('#submit');
    submitBtn.click(checkLocation);
    let location = $('#location');

    function checkLocation() {
        $.get(locationsUrl)
            .then(displayLocation)
            .catch(displayError);
    }

    function displayLocation(baseCitiesObj) {
        let cityCode = '';
        for (let city of baseCitiesObj) {
            if (city.name == location.val()) {
                cityCode = city.code;
            }
        }
        $.get(forecastTodayUrl + cityCode + ".json")
            .then(displayTodayWeather)
            .catch(displayError);
        $.get(forecastUpcomingUrl + cityCode + ".json")
            .then(displayUpcomingWeather)
    }

    function displayTodayWeather(params) {
        let currDiv = $("#current");
        $("#current span").remove();
        let condition = params.forecast.condition;
        let spanConditionSymb = `<span class="condition symbol">${defineSymbol(condition)}</span>`;
        currDiv.append(spanConditionSymb);
        let degree = '&#176;';
        let spanConditions = $("<span>").attr('class', 'condition');
        spanConditions.append(`<span class="forecast data">${params.name}</span><br>`);
        spanConditions.append(`<span class="forecast data">${params.forecast.low + degree}/${params.forecast.high + degree}</span><br>`);
        spanConditions.append(`<span class="forecast data">${params.forecast.condition}</span>`);
        currDiv.append(spanConditions);
    }

    function displayUpcomingWeather(ojb) {
        let currDiv = $("#upcoming");
        $("#upcoming span").remove();
        let degree = '&#176;';
        for (let day of ojb.forecast) {
            let condition = day.condition;
            let miniSpan = $("<span>").attr('class', 'upcoming');
            miniSpan.append(`<span class="symbol">${defineSymbol(condition)}</span><br>`);
            miniSpan.append(`<span class="forecast data">${day.low + degree}/${day.high + degree}</span><br>`);
            miniSpan.append(`<span class="forecast data">${day.condition}</span>`);
            currDiv.append(miniSpan);
        }
        $('#forecast').attr('style', 'visible');
    }

    function defineSymbol(condition) {
        let symbol = 'Problem occurred';
        if (condition == 'Sunny') {
            symbol = '&#x2600;';
        } else if (condition == 'Partly sunny') {
            symbol = '&#x26C5;';
        } else if (condition == 'Overcast') {
            symbol = '&#x2601;';
        } else if (condition == 'Rain') {
            symbol = '&#x2614;';
        }
        return symbol;
    }

    function displayError(error) {
        let errDiv = $("<div>").text("Not supported city");
        // let errDiv = $("<div>").text(`Error ${error.status} : (${error.statusText})`);
        $('#forecast').prepend(errDiv);
        setTimeout(function () {
            $(errDiv).fadeOut(function () {
                $(errDiv).remove();
            });
        }, 3000);
    }
}