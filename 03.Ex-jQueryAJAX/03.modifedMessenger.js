function attachEvents() {
    let textArea = $("#messages");
    let authorInput = $('#author');
    let contentInput = $('#content');
    textArea.attr('disabled', 'disabled');
    // let postsUrl = 'https://messenger-61ace.firebaseio.com/-KWw8sJ5TShAnOJ2TM1n.json';
    let postsUrl='https://messenger-5298f.firebaseio.com/messenger.json';
    $('#refresh').click(refresh);
    $('#submit').click(send);
    function send() {
        let message = {
            author: authorInput.val(),
            content: contentInput.val(),
            timestamp: Date.now()
        };
        $.post(postsUrl, JSON.stringify(message))
            .then(refresh);
        authorInput.attr('disabled','disabled');
        contentInput.val('');
        scrollToBottom();
    }

    function refresh() {
        $.get(postsUrl)
            .then(displayMessages);
        scrollToBottom();
    }
    function displayMessages(messages) {
        textArea.empty();
        let keys = Object.keys(messages).sort((a, b)=>messages[a].timestamp - messages[b].timestamp);
        for (let msg of keys) {
            let curMsg = messages[msg];
            textArea.append(curMsg.author + ': ' + curMsg.content + '\n');
        }
    }
    function scrollToBottom() {
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }
    window.setInterval(function () {
        refresh()
    }, 1000);
}