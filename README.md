# ws-heartbeats

Ping / pong heartbeats for [node ws](https://github.com/websockets/ws).

## Usage

```js
require('ws-heartbeats')(websocketClient, [Optional] options)
```

### Example

```bash
var sendHeartbeats = require('ws-heartbeats');

websocketServer.on('connection', function (websocketClient) {
    sendHeartbeats(websocketClient);
});
```

## Options

An optional hash containing a subset of the following:

* `heartbeatTimeout` - The period in which to deem a client dead in ms.
* `heartbeatInterval` - The time between each ping to a client in ms.


## Test

`npm test`
