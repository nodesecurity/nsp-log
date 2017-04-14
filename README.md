### nsp-log

This is the logger we use for backend stuff for the node security platform. It sends stuff to stackdriver logging.

#### Usage:

```js
const Logger = require('nsp-log');
const logger = new Logger({
  name: 'module_name',
  disable: false, // if set to true all the logging methods will be silently ignored
  auth: {}, // stackdriver auth options
  project_id: 'my-cool-project', // google cloud project
  resource: { /* stackdriver resource */ } // OPTIONAL
});

logger.log('hi', { some: 'labels' });
logger.info();
logger.debug();
logger.warn();
logger.error();
```

If `auth` is defined it will be used to authenticate the logging agent, this is usually not needed when deployed in GCE and can be left out entirely.

If `resource` is not defined, but `project_id` is or `GCLOUD_PROJECT` is exported in your environment, a resource will be automatically created for you. If `resource`, `project_id` and `GCLOUD_PROJECT` are all unset this library will fallback to a console based logger.
