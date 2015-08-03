import http from 'http';

const _ = new WeakMap();

class Server {
  constructor ( config ) {
    const props = {
      'event': config.event,
      'handlers': [],
      'id': 1,
      'reporting': config.reporting,
      'requests': new Map(),
      'server': null,
    };

    _.set( this, props );

    this.init();
  }

  init () {
    const event = _.get( this ).event;
    const handlers = _.get( this ).handlers;
    const requests = _.get( this ).requests;

    event.subscribe( 'response.handler.register', data => {
      handlers.push( data.name );
    });

    event.subscribe( 'response.handler.error', data => {
      const request = requests.get( data.id );

      if ( request ) {
        request.handlerErrors++;

        if ( request.handlerErrors === handlers.length ) {
          event.publish( 'response.error', data );
        }
      }
    });

    event.subscribe( 'response.send', data => {
      const request = requests.get( data.id );

      request.response.statusCode = data.statusCode;

      if ( data.content ) {
        request.response.setHeader( 'Content-Type', data.contentType );
        request.response.write( data.content );
      }

      request.response.end();

      requests.delete( data.id );
    });
  }

  listen ( port ) {
    const event = _.get( this ).event;
    const reporting = _.get( this ).reporting;
    const requests = _.get( this ).requests;
    const server = _.get( this ).server;

    if ( !server ) {
      _.get( this ).server = http.createServer(( request, response ) => {
        const requestId = _.get( this ).id++;

        requests.set( requestId, {
          'handlerErrors': 0,
          'response': response,
        });

        if ( reporting.level > 0 ) {
          reporting.reporter( `-- ${request.method} request received: ${request.url}` );
        }

        event.publish( 'request.received', {
          'id': requestId,
          'method': request.method,
          'time': Date.now(),
          'url': request.url,
        });
      });

      _.get( this ).server.listen( port, () => {
        if ( reporting.level > 0 ) {
          reporting.reporter( `-- Listening for requests on http://localhost:${port}` );
        }

        event.publish( 'request.listening', {
          'location': `http://localhost:${port}`,
        });
      });
    }
  }

  close () {
    const event = _.get( this ).event;
    const requests = _.get( this ).requests;
    const server = _.get( this ).server;

    for ( let id of requests.keys()) {
      event.publish( 'response.send', {
        'id': id,
        'statusCode': 503,
        'time': Date.now(),
      });
    }

    if ( server ) {
      server.close();
    }
  }
}

export default Server;
