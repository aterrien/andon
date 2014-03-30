module.exports = [
    {
        id: 'median_queries',
        label: 'Queries',
        api: {
            url: 'http://anthonyterrien.com',
            method: 'GET'
        },
        analyze: function(data, fn) {
            var i = Math.floor((Math.random()*10)+1);

            // test
            if(i > 6) {
                this.critical("More than " + i + " queries per page");
            } else if(i > 3) {
                this.warning("Between 3 and 6 queries per page");
            } else {
                this.notice("Between 0 and 3 queries per page");
            }

        },
        ttl: 1000
    },
    {
        id: 'median_duration',
        label: 'Page duration',
        api: {
            url: 'http://anthonyterrien.com',
            method: 'GET'
        },
        analyze: function(data, fn) {
            var i = Math.floor((Math.random()*10)+1);

            // test
            if(i > 6) {
                this.critical("More than 100ms");
            } else if(i > 3) {
                this.warning("Between 50 and 100ms");
            } else {
                this.notice("Between 0 and 50ms");
            }

        },
        ttl: 1000
    }
];