var statsdAnalyzerDuration = function(data, fn) {
    var points = data[0]['datapoints'],
        current = points[points.length - 2],
        currentDuration = Math.round(current[0]);

    var thresholds = {
        'critical' : 400,
        'warning' : 300,
        'notice' : 200
    }

    var detect = function(level, duration) {
        if(duration > thresholds[level]) {
            return duration + 'ms (' + '>' + thresholds[level] + 'ms)';
        }
        return false;
    };

    var critical = function(data) {return detect('critical', currentDuration);}
        , warning = function(data) {return detect('warning', currentDuration);}
        , notice = function(data) {return detect('notice', currentDuration);};

    var msg = null;
    if(msg = critical(currentDuration)) {
        this.critical(msg);
    } else if(msg = warning(currentDuration)) {
        this.warning(msg);
    } else if(msg = notice(currentDuration)) {
        this.notice(msg);
    } else {
        this.green(currentDuration + 'ms');
    }

};

var statsdAnalyzerQueries = function(data, fn) {
    var points = data[0]['datapoints'],
        current = points[points.length - 2],
        currentValue = Math.round(current[0]);

    var thresholds = {
        'critical' : 20,
        'warning' : 15,
        'notice' : 10
    }

    var detect = function(level, value) {
        if(value > thresholds[level]) {
            return value + ' (' + '>' + thresholds[level] + ')';
        }
        return false;
    };

    var critical = function(data) {return detect('critical', currentValue);}
        , warning = function(data) {return detect('warning', currentValue);}
        , notice = function(data) {return detect('notice', currentValue);};

    var msg = null;
    if(msg = critical(currentValue)) {
        this.critical(msg);
    } else if(msg = warning(currentValue)) {
        this.warning(msg);
    } else if(msg = notice(currentValue)) {
        this.notice(msg);
    } else {
        this.green(currentValue);
    }

};

module.exports = [
    {
        id: 'syslog_count',
        label: 'Runtime - Syslog',
        api: {
            url: '/api/syslogng/count',
            method: 'GET'
        },
        analyze: function(data, fn) {
            var thresholds = {
                'chaos' : {
                    'crit' : 5000,
                    'err' : 5000,
                    'warn' : 5000
                },
                'critical' : {
                    'crit' : 100,
                    'err' : 300,
                    'warn' : 400
                },
                'warning' : {
                    'crit' : 50,
                    'err' : 200,
                    'warn' : 250
                },
                'notice' : {
                    'crit' : 10,
                    'err' : 100,
                    'warn' : 150
                }
            }

            var detect = function(level, data) {
                var exceeded = false, message = [];
                for(threshold in thresholds[level]) {
                    if(data[threshold] > thresholds[level][threshold]) {
                        exceeded = true;
                        message.push(threshold + '=' + data[threshold] + ' (' + '>' + thresholds[level][threshold] + ')');
                    }
                }
                if(exceeded == false) {
                    return false;
                } else {
                    return message.join(', ');
                }
            };

            var chaos = function(data) {return detect('chaos', data);}
                , critical = function(data) {return detect('critical', data);}
                , warning = function(data) {return detect('warning', data);}
                , notice = function(data) {return detect('notice', data);};

            var msg = null;
            if(msg = chaos(data)) {
                this.critical('Under attack ! ' + msg );
            } else if(msg = critical(data)) {
                this.critical(msg);
            } else if(msg = warning(data)) {
                this.warning(msg);
            } else if(msg = notice(data)) {
                this.notice(msg);
            } else {
                this.green();
            }

        },
        ttl: 1000
    },
    {
        id: 'statsd_duration_tags',
        label: 'Runtime - Tags page duration',
        api: {
            url: '',
            method: 'GET'
        },
        analyze: statsdAnalyzerDuration,
        ttl: 10000
    },
    {
        id: 'statsd_duration',
        label: 'Runtime - Global page duration',
        api: {
            url: '',
            method: 'GET'
        },
        analyze: statsdAnalyzerDuration,
        ttl: 10000
    },
    {
        id: 'statsd_duration_queries',
        label: 'Runtime - Queries/page',
        api: {
            url: '',
            method: 'GET'
        },
        analyze: statsdAnalyzerQueries,
        ttl: 10000
    },
];
