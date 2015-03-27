module.exports = function socketTimeout (webSocketClient, options) {
    var pingNotReceivedTimeout;
    var schedulePingTimeout;

    options = options || {};
    options.heartbeatTimeout = options.heartbeatTimeout || 30000;
    options.heartbeatInterval = options.heartbeatInterval || 10000;

    setPingTimeout();
    schedulePing();

    ['message', 'pong'].forEach(function (evt) {
        webSocketClient.on(evt, function () {
            schedulePing();
            setPingTimeout();
        });
    });

    function schedulePing() {
        clearTimeout(schedulePingTimeout);
        schedulePingTimeout = setTimeout(function () {
            webSocketClient.ping();
            schedulePing();
        }, options.heartbeatInterval);
    };

    function setPingTimeout() {
        clearTimeout(pingNotReceivedTimeout);
        pingNotReceivedTimeout = setTimeout(function () {
            webSocketClient.close();
            tearDownTimers();
        }, options.heartbeatInterval + options.heartbeatTimeout);
    }

    function tearDownTimers() {
        clearTimeout(schedulePingTimeout);
        clearTimeout(pingNotReceivedTimeout);
    }

    webSocketClient.on('close', tearDownTimers);
};
