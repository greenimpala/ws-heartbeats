var events = require('events');
var sinon = require('sinon');
var assert = require('chai').assert;
var _ = require('lodash');

var heartbeats = require('../');

function mockWebSocketClient (closeFn, pingFn) {
    return Object.create(events.EventEmitter.prototype, {
        close: { value: closeFn },
        ping: { value: pingFn }
    });
}

describe('Websocket Client Heartbeats', function () {
    var webSocketClient;

    var webSocketClose;
    var webSocketPing;

    var options = {
        heartbeatTimeout: 5000,
        heartbeatInterval: 2000
    };

    before(function () {
        this.clock = sinon.useFakeTimers();
    });

    after(function () {
        webSocketClient.emit('close');
        this.clock.restore();
    });

    beforeEach(function () {
        webSocketClose = sinon.stub();
        webSocketPing = sinon.stub();
        webSocketClient = mockWebSocketClient(webSocketClose, webSocketPing);
    });

    it('sends pings every heartbeat interval', function () {
        heartbeats(webSocketClient, _.defaults({ heartbeatTimeout: 99999 }, options));

        this.clock.tick(options.heartbeatInterval * 10);

        assert.equal(webSocketPing.callCount, 10)
    });

    it('closes if pong not received within interval plus timeout', function () {
        heartbeats(webSocketClient, options);

        this.clock.tick(options.heartbeatInterval + options.heartbeatTimeout);

        assert.isTrue(webSocketPing.called);
        assert.isTrue(webSocketClose.calledOnce);
    });

    it('does not close if pong received within interval', function () {
        heartbeats(webSocketClient, options);

        this.clock.tick(options.heartbeatInterval - 1);
        webSocketClient.emit('pong');
        this.clock.tick(options.heartbeatInterval - 1);
        webSocketClient.emit('pong');
        this.clock.tick(options.heartbeatInterval - 1);

        assert.equal(webSocketPing.callCount, 0);
        assert.isTrue(webSocketClose.notCalled);
    });

    it('does not close if messages received within interval', function () {
        heartbeats(webSocketClient, options);

        this.clock.tick(options.heartbeatInterval - 1);
        webSocketClient.emit('message');
        this.clock.tick(options.heartbeatInterval - 1);
        webSocketClient.emit('message');
        this.clock.tick(options.heartbeatInterval - 1);

        assert.equal(webSocketPing.callCount, 0);
        assert.isTrue(webSocketClose.notCalled);
    });

    it('tears down timers if client connection closed externally', function () {
        heartbeats(webSocketClient, options);

        webSocketClient.emit('close');

        this.clock.tick(options.heartbeatInterval);

        assert.isTrue(webSocketPing.notCalled);
        assert.isTrue(webSocketClose.notCalled);
    });
});
