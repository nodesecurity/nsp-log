'use strict';

const Assert = require('assert');
const Logging = require('@google-cloud/logging');

class NSPConsoleLogger {
  _prefix(level, labels = {}) {

    let label = '';
    for (const key in labels) {
      label += `${key}:${labels[key]} `;
    }

    let result = `[${level}]`;
    if (label) {
      result += ` (${label.trim()})`;
    }

    return result;
  }

  log(data, labels) {

    return console.log(this._prefix('log', labels), data);
  }

  info(data, labels) {

    return console.log(this._prefix('info', labels), data);
  }

  debug(data, labels) {

    return console.log(this._prefix('debug', labels), data);
  }

  warn(data, labels) {

    return console.warn(this._prefix('warn', labels), data);
  }

  error(data, labels) {

    return console.error(this._prefix('error', labels), data);
  }
}

class NSPLogger {
  constructor(options) {

    this.disabled = options.hasOwnProperty('disable') ? options.disable : false;
    if (this.disabled) {
      return;
    }

    Assert(typeof options.name === 'string' && options.name, 'name must be a string');
    this.name = options.name;

    if (typeof options.resource === 'object' &&
        options.resource !== null &&
        options.resource.hasOwnProperty('type')) {

      this.resource = options.resource;
    }
    else if (typeof options.project_id === 'string' && options.project_id) {
      this.resource = {
        type: 'global',
        labels: {
          project_id: options.project_id
        }
      };
    }
    else if (process.env.GCLOUD_PROJECT) {
      this.resource = {
        type: 'global',
        labels: {
          project_id: process.env.GCLOUD_PROJECT
        }
      };
    }

    if (!this.resource) {
      return new NSPConsoleLogger();
    }

    this.logger = Logging(options.auth).log(this.name, { removeCircular: true });
  }

  _log(level, data, labels = {}) {

    if (this.disabled) {
      return Promise.resolve();
    }

    const metadata = {
      timestamp: new Date(),
      operation: {
        producer: this.name
      },
      resource: this.resource,
      labels
    };

    let message;
    if (level === 'error' &&
        data instanceof Error) {

      message = {
        message: data.stack,
        serviceContext: {
          service: this.name
        }
      };
    }
    else {
      message = data;
    }

    const entry = this.logger.entry(metadata, message);
    return this.logger[level](entry).catch((err) => {

      console.error(err.stack);
      return Promise.resolve();
    });

  }

  log(entry, labels) {

    this._log('info', entry, labels);
  }

  info(entry, labels) {

    this._log('info', entry, labels);
  }

  debug(entry, labels) {

    this._log('debug', entry, labels);
  }

  error(entry, labels) {

    this._log('error', entry, labels);
  }
}

module.exports = NSPLogger;
