'use strict';

const Util = require('util');

class Logger {
    constructor(name, exchange, config) {

        this.name = name;
        this.exchange = exchange;
        this.config = config;
    }

    _connect() {

        // either we already have a connection, or we don't want one
        if (this.rabbit ||
            !this.config) {

            return Promise.resolve();
        }

        // late require because simply requiring wascally seems to hold the process open
        this.rabbit = require('wascally');

        const connection = Object.assign({}, this.config, { replyQueue: false });
        return this.rabbit.configure({
            connection: connection,
            exchanges: [{
                name: this.exchange,
                type: 'fanout',
                autoDelete: false
            }]
        });
    }

    _log(type, tags, args) {

        const message = Util.format.apply(null, args);
        return this._connect().then(() => {

            // user didn't want a connection, so just dump to the console
            if (!this.rabbit) {
                console.log(`${this.name}/${type} [${tags.join(',')}]: ${message}`);
                return Promise.resolve();
            }

            const fullTags = [this.name].concat(tags);
            return this.rabbit.publish(this.exchange, {
                type: type,
                body: {
                    tags: fullTags,
                    message: message
                }
            });
        });
    }

    log() {

        this._log('log', ['info'], arguments);
    }

    info() {

        this._log('log', ['info'], arguments);
    }

    debug() {

        this._log('log', ['debug'], arguments);
    }

    error() {

        this._log('error', ['error'], arguments);
    }
}

module.exports = Logger;
