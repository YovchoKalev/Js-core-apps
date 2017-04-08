function attachEvents() {
    const kinveyAppId = "kid_r1EW3pdfl";
    const serviceUrl = "https://baas.kinvey.com/appdata/" + kinveyAppId + "/players/";
    const kinveyUsername = "martin";
    const kinveyPassword = "m";
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {"Authorization": "Basic " + base64auth};

    let playersDiv = $('#players');
    let btnAddPlayer = $('#addPlayer');
    let inputNewPlayer = $('#addName');
    let gameSaveButton = $('#save');
    let gameReloadButton = $('#reload');
    let gameCanvas = $('#canvas');

    let loadedPlayers = [];
    let currentPlayerHolder;

    function loadInfo() {
        $.get({
            url: serviceUrl,
            headers: authHeaders
        }).then(loadPlayer).catch(displayError);
    }

    loadInfo();
    $(btnAddPlayer).click(addPlayer);
    $(gameSaveButton).click(savePlayerProgress);
    $(gameReloadButton).click(reloadPlayerBullets);

    function deletePlayerFromDb(id) {
        let request = {
            method: 'DELETE',
            url: `${serviceUrl}${id}`,
            headers: authHeaders
        };
        $.ajax(request);
    }

    function loadPlayer(players) {
        $(btnAddPlayer).removeAttr('disabled');

        $("#players").empty();
        for (let player of players) {
            if (player['money'] <= 0 && player['bullets'] <= 0) {
                deletePlayerFromDb(player['_id']);
            } else {
                fillForm(player);
                loadedPlayers.push(player);
            }
        }
    }
    function fillForm(curPlayer) {
        let id = curPlayer._id;
        let name = curPlayer.name;
        let money = curPlayer.money;
        let bullets = curPlayer.bullets;
        let curDiv = $("<div>").addClass('player').attr('data-id', id);
        let btnPlay = $('<button>').addClass('play').text('Play');
        let btnDelete = $('<button>').addClass('delete').text('Delete');
        playersDiv.append(curDiv
            .append($("<div>").addClass('row')
                .append(`<label>Name: </label>`)
                .append(`<label class="name">${name}</label>`))
            .append($("<div>").addClass('row')
                .append(`<label>Money: </label>`)
                .append(`<label class="money">${money}</label>`))
            .append($("<div>").addClass('row')
                .append(`<label>Bullets: </label>`)
                .append(`<label class="bullets">${bullets}</label>`))
            .append(btnPlay.click(playGame))
            .append(btnDelete.click(deletePlayer)));
    }
    function addPlayer() {
        if(!inputNewPlayer.val())return;
        $(this).attr('disabled', true);
        let playerData = JSON.stringify({
            name: inputNewPlayer.val(),
            money: 500,
            bullets: 6
        });
        let request = {
            method: "POST",
            url: serviceUrl,
            headers: authHeaders,
            data: playerData,
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request).then(loadInfo).catch(displayError);
        inputNewPlayer.val('');
    }
    function reloadPlayerBullets() {
        currentPlayerHolder['money'] -= 60;
        currentPlayerHolder['bullets'] += 6;
    }
    function savePlayerProgress() {
        let playerData = {
            name: currentPlayerHolder['name'],
            money: currentPlayerHolder['money'],
            bullets: currentPlayerHolder['bullets']
        };
        let request = {
            method: "PUT",
            url: `${serviceUrl}${currentPlayerHolder['_id']}`,
            headers: authHeaders,
            data: JSON.stringify(playerData),
            contentType: "application/json",
            dataType: 'json'
        };
        $.ajax(request).then(clearCanvasInterval).catch(displayError);
        function clearCanvasInterval() {
            clearInterval(canvas.intervalId);
            showHideGameControls('hide');
            loadInfo();
        }
    }
    function playGame() {
        let id = $(this).parent().attr('data-id');
        let targetPlayerObj  = loadedPlayers.find(p => p['_id'] == id);
        currentPlayerHolder=new CurrentPlayer(targetPlayerObj);
        loadCanvas(currentPlayerHolder);
        showHideGameControls('show')
    }
    function showHideGameControls(action) {
        switch (action) {
            case 'show':
                gameReloadButton.show();
                gameSaveButton.show();
                // $(divGameButtons).css('display', '');
                $(gameCanvas).css('display', '');
                break;
            case 'hide':
                gameSaveButton.hide();
                gameReloadButton.hide();
                // $(divGameButtons).css('display', 'none');
                $(gameCanvas).css('display', 'none');
                break;
        }
    }
    function deletePlayer() {
        $(this).parent().fadeOut();
        let id = $(this).parent().attr('data-id');
        let request = {
            method: 'DELETE',
            url: serviceUrl + id,
            headers: authHeaders
        };
        $.ajax(request);
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
}
/*class Player {
    constructor(playerObject) {
        this._id = playerObject.id;
        this.money = 0;
        this._selector = `.player[data-id="${playerObject._id}"]`;
        this._endgame = false;
        this.name = playerObject.name;
        this.money = playerObject.money;
        this.bullets = playerObject.bullets;
    }
    set money(money){

    }
}*/

class CurrentPlayer {
    constructor(playerObj) {
        this._id = playerObj['_id'];
        this._selector = `.player[data-id="${playerObj['_id']}"]`;
        this._money = 0;
        this._endgame = false;
        this.name = playerObj['name'];
        this.money = playerObj['money'];
        this.bullets = playerObj['bullets'];
    }

    set money(money) {
        if (this._money > 0) {
            let test = this._money - Number(money);
            if (test < 0)
                this._endgame = true;
        }
        if (!this.endgame)
            this._money = money;
        $(this._selector).find('.money').text(this.money);
    }
    get money() { return this._money; }

    set bullets(bullets) {
        this._bullets = bullets;
        $(this._selector).find('.bullets').text(this.bullets);
    }
    get bullets() { return this._bullets; }

    get endgame() {
        return this._money < 60 && this.bullets == 0;
    }
}
