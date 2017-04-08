let url = "https://baas.kinvey.com/appdata/kid_BJe588Szx/football-matches";
let headers = {
    "Authorization": "Basic Z3Vlc3Q6Z3Vlc3Q=",
    "Content-Type": "application/json"
};

let myBets = [];


$('.content-holder table tr td button').on('click', function (ev) {
    let currentId = Number($(this).parent().attr('id').replace('match-', '').replace('-button', ''));
    let value = Number($('#match-' + currentId + '-bet input').val());
    let betType = $('#match-' + currentId + '-bet-type select option:selected').text().toString().toLowerCase();

    let ratio = Number($('#match-' + currentId + '-' + betType).text());

    let homeTeam = $('#match-' + currentId + '-home').text();
    let awayTeam = $('#match-' + currentId + '-away').text();
    let time = $('#match-' + currentId + '-time').text();

    let bet = {
        id: currentId,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        time: time,
        betType: betType,
        betRatio: ratio,
        betValue: value,
        estimatedWin: (ratio * value).toFixed(2)
    };

    myBets.push(bet);

    $('#matches').click();
});