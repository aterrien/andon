require(['jquery', 'socket.io'], function($) {
    var socket = io.connect('//' + location.hostname + ':443'),
        $body = $(document.body),
        waiting = true;

    $body.html('Starting ...');



    socket.on('message', function (data) {
        if(waiting) {
            waiting = false;
            $body.empty();
        }

        var elmt = $('#' + data.id);

        if(!elmt.length) {
            elmt = $('<div class=job>').attr('id', data.id);
            elmt.appendTo($body);
        }

        if(data.level == 'CRITICAL') {
            $body.prepend(elmt);
        } else if(data.level == 'WARNING') {
        } else if(data.level == 'NOTICE') {
            $body.append(elmt);
        }

        elmt.attr('class', 'andon-' + data.level)
            .html('<div class=message><span><strong>' + data.id + '</strong></span>'
                + ' <span>' + data.info + '</span></div>'
                + '<div class=date>' + data.last + '</div>'
            );

        //input.val(data);
        //socket.emit('my other event', { my: 'data' });
    });
});