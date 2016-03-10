### nsp-log

This is the logger we use for backend stuff for the node security platform. It sends stuff to a rabbit exchange.

#### Usage:

```js
const Logger = require('nsp-log');
const logger = new Logger({
  name: 'module_name',
  exchange: 'rabbit_exchange_name',
  connection: { /* rabbit config */ }
});

logger.log('hi');
```

where the `rabbit config` noted above is an object that gets passed as the `connection` parameter to [`wascally.configure`](https://github.com/leankit-labs/wascally#addconnection--options-)

If the rabbit config is falsey, logging will be sent to the console instead.
