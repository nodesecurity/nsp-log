'use strict';

class Logger {
    constructor(name, exchange, config) {

        this.name = name;
        this.exchange = exchange;
        this.config = Object.assign({}, config, { replyQueue: false }); // forcibly disable the automatic reply queue
    }

    _connect() {

        // either we already have a connection, or we don't want one
        if (this.rabbit ||
            !this.config) {

            return Promise.resolve();
        }

        // late require because simply requiring wascally seems to hold the process open
        this.rabbit = require('wascally');
        return this.rabbit.configure({
            connection: this.config,
            exchanges: [{
                name: this.exchange,
                type: 'fanout',
                autoDelete: false
            }]
        });
    }

    _log(type, tags, message) {

        return this._connect().then(() => {

            // user didn't want a connection, so just dump to the console
            if (!this.rabbit) {
                console.log(`${type} [${tags.join(',')}]: ${message}`);
                return Promise.resolve();
            }

            return this.rabbit.publish(this.exchange, {
                type: type,
                body: {
                    tags: tags,
                    message: message
                }
            });
        });
    }

    log(message) {

        this._log('log', [this.name, 'info'], message);
    }

    info(message) {

        this._log('log', [this.name, 'info'], message);
    }

    debug(message) {

        this._log('log', [this.name, 'debug'], message);
    }

    error(message) {

        this._log('error', [this.name, 'error'], message);
    }
}

module.exports = Logger;
