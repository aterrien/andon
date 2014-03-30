// Configure dependencies
require.config({
    baseUrl: 'js',
    paths: {
        'app': 'app',
        'jquery': 'vendor/jquery/jquery-2.0.3.min',
        'socket.io': 'vendor/socket.io/socket.io.min'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

// Run the app !
requirejs(['app/main']);