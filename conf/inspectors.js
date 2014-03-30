module.exports = [
    {
        id: 'deploy',
        api: {
            url: 'http://anthonyterrien.com',
            method: 'GET'
        },

        distill: function(data, fn) {
            var i = Math.floor((Math.random()*10)+1);

            //if(data.main.temp > 280) {}

            if(i > 6) {
                this.critical("crit!!!!");
            } else if(i > 3) {
                this.warning("crit!!!!");
            } else {
                this.notice("crit!!!!");
            }

        },
        ttl: 1000
    }
];