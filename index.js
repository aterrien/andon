var express = require('express'),
    consolidate = require('consolidate'),
    http = require('http'),
    path = require('path'),
    app = express(),
    config = {
        server: require('./conf/server'),
        inspectors: require('./conf/inspectors')
    };

// configure
app.configure( function() {
    // all environments
    app.set('port', process.env.PORT || 3000);

    //app.set('view engine', 'jade');
    app.set('view engine', 'dust');
    app.set('views', __dirname + '/views');
    app.engine('dust', consolidate.dust);

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    //console.log('ENV',app.get('env'));
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
});

app.get('/',  function(req, res){
    res.render('index', {
        title: 'Home'
    });
});

var Andon = function(config) {
    this.config = config;
    this.jobs = [];
    this.running = false;
};
Andon.prototype = {
    run: function() {
        var _this = this;

        // HTTP Server
        http.createServer(app)
            .listen(this.config.server.web.http.port, function(){
                console.log('HTTP server listening on port ' + _this.config.server.web.http.port);
            }
        );

        // TODO queue de notification sur socket.io
        var io = require('socket.io').listen(this.config.server.web.ws.port),
            _this = this;
        this.sockets = io.sockets;
        this.sockets.on(
            'connection',
            function (socket) {
                _this.socket = socket;

                if(!_this.running) {
                    _this.running = true;
                    _this.execute();
                }
            }
        );

        for(var i in this.config.inspectors) {
            this.jobs.push(new Job(this.config.inspectors[i], this));
        }
    },
    execute: function(fn) {
        for(var j in this.jobs) {
            this.jobs[j].execute();
        }
        return this;
    },
    emit: function(message) {
        this.sockets.emit('message', message);
        return this;
    }
};

var Job = function(config, andon) {
    this.config = config;
    this.andon = andon;
    this.lastLevel = null;
    this.countCurrent = 0;
};
Job.prototype = {
    execute: function() {
        var _this = this, request = require('request'), _this = this;

        setInterval(function () {
            // Asynchronous request
            request(
                _this.config.api,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // compressed content
                        var encoding = response.headers['content-encoding']
                        if(encoding && encoding.indexOf('gzip')>=0) {
                            body = uncompress(body);
                        }
                        body = body.toString('utf-8');

                        if(response.headers['content-type'].indexOf('application/json') > -1) {
                            var json = JSON.parse(body);
                            _this.config.analyze.call(_this, json);
                        } else {
                            _this.config.analyze.call(_this, body);
                        }
                    } else {
                        console.log(error, response.statusCode);
                        _this.exception('can\'t collect datas');
                    }
                });
        }, this.config.ttl);
    },
    emit: function(message, level) {

        // count alerts
        if(this.lastLevel != level) {
            this.countCurrent = 0;
            this.lastLevel = level;
        }
        this.countCurrent++;

        return this.andon.emit({
            id: this.config.id,
            label: this.config.label,
            info: message,
            level: level,
            ttl: this.config.ttl,
            time: (new Date()).toJSON(),
            count: this.countCurrent
        });
    },
    critical: function(message) {
        return this.emit(message, "CRITICAL");
    },
    warning: function(message) {
        return this.emit(message, "WARNING");
    },
    notice: function(message) {
        return this.emit(message, "NOTICE");
    },
    exception: function(message) {
        return this.emit(message, "EXCEPTION");
    }
};

(new Andon(config)).run();



