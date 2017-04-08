function attachEvents() {
    let textArea = $("#messages");
    textArea.attr('disabled', 'disabled');
    let authorInput = $('#author');
    let contentInput = $('#content');
    let postsUrl = 'https://messenger-61ace.firebaseio.com/-KWw8sJ5TShAnOJ2TM1n.json';
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
    }
    function refresh() {
        return $.get(postsUrl)
            .then(displayMessages);
    }
    function displayMessages(messages) {
        textArea.empty();
        let keys=Object.keys(messages).sort((a,b)=>messages[a].timestamp-messages[b].timestamp);
        for (let msg of keys) {
            let curMsg=messages[msg];
            textArea.append(curMsg.author+': '+curMsg.content+'\n');
        }
    }
}