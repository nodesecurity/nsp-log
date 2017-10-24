'use strict';

const Assert = require('assert');
const Stringify = require('json-stringify-safe');

const internals = {};
internals.symbols = {
  log: Symbol('log')
};

class NSPLogger {
  constructor({ disabled, name, labels = {} }) {

    this.disabled = disabled;

    this.name = name || process.env.HOSTNAME;
    Assert(typeof this.name === 'string' && this.name, 'name must be a string, or HOSTNAME must be exported');

    this.labels = labels;
  }

  [internals.symbols.log](severity, message, labels = {}) {

    if (this.disabled) {
      return;
    }

    const now = Date.now();

    const payload = {
      severity,
      message,
      labels: Object.assign({}, this.labels, labels),
      timestamp: {
        seconds: Math.floor(now / 1000),
        nanos: Math.round(now % 1000) * 1000000
      }
    };

    if (['CRITICAL', 'ERROR'].includes(severity)) {
      payload.message = message instanceof Error ? message.stack : message;
      payload.serviceContext = {
        service: this.name
      };
    }

    console.log(Stringify(payload));
  }

  log(message, labels) {

    return this[internals.symbols.log]('INFO', message, labels);
  }

  info(message, labels) {

    return this[internals.symbols.log]('INFO', message, labels);
  }

  debug(message, labels) {

    return this[internals.symbols.log]('DEBUG', message, labels);
  }

  warn(message, labels) {

    return this[internals.symbols.log]('WARNING', message, labels);
  }

  error(message, labels) {

    return this[internals.symbols.log]('ERROR', message, labels);
  }

  critical(message, labels) {

    return this[internals.symbols.log]('CRITICAL', message, labels);
  }
}

module.exports = NSPLogger;
