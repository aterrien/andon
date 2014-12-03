require(['jquery', 'socket.io'], function($) {
    var socket = null,
        connect = function() {
            socket = io.connect('//' + location.hostname + ':8082')
        },
        $body = $(document.body),
        waiting = true,
        intervalReconnect = null;

    $body.html('Starting ...');

    connect();

    socket.on('connect', function () {
        if(intervalReconnect !== null) {
            window.clearInterval(intervalReconnect);
        }
    });

    socket.on('disconnect', function () {
        intervalReconnect = window.setInterval(
            function(){
                console.log('reconnect');
                connect();
            },
            10000
        );
    });

    socket.on('message', function (data) {
        if(waiting) {
            waiting = false;
            $body.empty();
        }

        var elmt = $('#' + data.id),
            elmtFound = elmt.length;

        if(!elmtFound) {
            elmt = $('<div class=job>').attr('id', data.id).hide();
            elmt.appendTo($body).fadeIn();
        }

        if(data.level == 'CRITICAL') {
            $body.prepend(elmt);
        } else if(data.level == 'WARNING') {
        } else if(data.level == 'NOTICE') {
            $body.append(elmt);
        }

        if(!elmt.hasClass('andon-' + data.level)) {
            elmt.attr('class', 'job andon-' + data.level);
        }

        if(!elmtFound) {
            elmt.html('<div class=message><span><strong class=label>' + data.label + '</strong></span>'
                + ' <span class=info>' + data.info + '</span></div>'
                + '<div class=date>' + data.time + '</div>'
            );
        } else {
            // prevents
            elmt.find('.label').html(data.label);
            elmt.find('.info').html(data.info);
            elmt.find('.date').html(data.date);
        }

        //input.val(data);
        //socket.emit('my other event', { my: 'data' });
    });
});
