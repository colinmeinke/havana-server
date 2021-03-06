# Havana server

[![NPM version](https://badge.fury.io/js/havana-server.svg)](http://badge.fury.io/js/havana-server)
[![Build Status](https://travis-ci.org/colinmeinke/havana-server.svg?branch=master)](https://travis-ci.org/colinmeinke/havana-server)
[![Dependency status](https://david-dm.org/colinmeinke/havana-server.svg)](https://david-dm.org/colinmeinke/havana-server.svg)

A server-side request/response dispatcher.

Havana server uses Node.js's
[HTTP server](https://nodejs.org/api/http.html)
to listen for requests. When a request is received Havana
server publishes a `request.received` event, subscribing
to `response.send` events published by a response handler.
When a `response.send` event is received Havana server
passes the response content back to the HTTP server.

## How to install

```
npm install havana-server
```

## How to use

```javascript
import Event from 'havana-event';
import Server from 'havana-server';

const event = new Event();

const reporting = {
  'level': 2, 
  'reporter': console.log,
};

const server = new Server({
  'event': event,
  'reporting': reporting,
});

// Add a response handler here

server.listen( 3000 );
```

## Event list

Events take the form of
[Havana event](https://github.com/colinmeinke/havana-event)
or a library with an interchangeable API.

### Publish

- `request.listening`: Signifies that Havana server is
  now listening for requests on the specified port.
- `request.received`: Signifies that Havana server has
  received a request on the specified port, publishing
  the request data for consumption by response handlers.
- `response.error`: Signifies that all registered response
  handlers have failed to provide a response.

### Subscribe

- `response.handler.register`: Allows a response handler to
  notify Havana server that it will attempt to handle
  requests.
- `response.handler.error`: Allows a response handler to
  notify Havana server that it has not been able to
  handle the request.
- `response.send`: Allows a response handler to notify
  Havana server that it has handled the request
  successfully, publishing the response data for consumption
  by Havana server.

## ES2015+

Havana server is written using ES2015+ syntax.

However, by default this module will use an ES5
compatible file that has been compiled using
[Babel](https://babeljs.io).

In the `dist` directory there are two files, the default
is `server.js`.

Havana server currently requires the 
[Babel polyfill](https://babeljs.io/docs/usage/polyfill).
You are expected to supply this yourself. However, as a
courtesy you will also find `server.with-polyfill.js` in the
`dist` directory.
