/* global describe beforeEach it */

require( 'gulp-babel/node_modules/babel-core/polyfill' );

import Server from '../../dist/server';
import chai from 'chai';
import Event from 'havana-event';
import fetch from 'node-fetch';

const expect = chai.expect;
const port = 3000;

let event;
let server;

describe( 'Server', () => {
  beforeEach(() => {
    event = new Event();

    server = new Server({
      'event': event,
      'reporting': {
        'level': 0,
        'reporter': console.log,
      },
    });
  });

  describe( '_', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( '_' );
    });
  });

  describe( 'event', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'event' );
    });
  });

  describe( 'handlers', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'handlers' );
    });
  });

  describe( 'id', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'id' );
    });

    it( 'should be incremented on each request received', done => {
      let id = null;

      event.subscribe( 'request.received', data => {
        expect( data.id ).to.not.equal( id );

        if ( id ) {
          server.close();
          done();
        }

        id = data.id;
      });

      event.subscribe( 'request.listening', () => {
        fetch( `http://localhost:${port}/hello` );
        fetch( `http://localhost:${port}/world` );
      });

      server.listen( port );
    });
  });

  describe( 'reporting', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'reporting' );
    });
  });

  describe( 'requests', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'requests' );
    });
  });

  describe( 'server', () => {
    it( 'should be private', () => {
      expect( server ).to.not.have.property( 'server' );
    });
  });

  describe( 'request.listening', () => {
    it( 'should be published when server is ready to dispatch', done => {
      event.subscribe( 'request.listening', () => {
        server.close();
        done();
      });

      server.listen( port );
    });
  });

  describe( 'request.received', () => {
    it( 'should be published when server receives a request', done => {
      event.subscribe( 'request.received', () => {
        server.close();
        done();
      });

      event.subscribe( 'request.listening', () => {
        fetch( `http://localhost:${port}/hello-world` );
      });

      server.listen( port );
    });
  });

  describe( 'response.error', () => {
    it( 'should be published when all registered handlers have failed to handle a request', done => {
      event.subscribe( 'response.error', () => {
        server.close();
        done();
      });

      event.publish( 'response.handler.register', {
        'name': 'hello',
      });

      event.subscribe( 'request.received', data => {
        event.publish( 'response.handler.error', {
          'id': data.id,
          'name': 'hello',
        });
      });

      event.subscribe( 'request.listening', () => {
        fetch( `http://localhost:${port}/hello-world` );
      });

      server.listen( port );
    });
  });

  describe( 'response.send', () => {
    const content = 'Hello world';
    const contentType = 'text/plain';
    const statusCode = 200;

    const responseData = {
      'content': content,
      'contentType': contentType,
      'statusCode': statusCode,
    };

    it( 'should send a response with the defined content', done => {
      const sendRequest = async () => {
        try {
          const response = await fetch( `http://localhost:${port}/hello-world` );
          const responseContent = await response.text();

          expect( responseContent ).to.equal( content );

          server.close();
          done();
        } catch ( error ) {
          server.close();
          done( error );
        }
      };

      event.subscribe( 'request.received', data => {
        event.publish( 'response.send', Object.assign({}, responseData, {
          'id': data.id,
        }));
      });

      event.subscribe( 'request.listening', sendRequest );

      server.listen( port );
    });

    it( 'should send a response with the defined Content-Type header', done => {
      const sendRequest = async () => {
        try {
          const response = await fetch( `http://localhost:${port}/hello-world` );

          expect( response.headers.get( 'Content-Type' )).to.equal( contentType );

          server.close();
          done();
        } catch ( error ) {
          server.close();
          done( error );
        }
      };

      event.subscribe( 'request.received', data => {
        event.publish( 'response.send', Object.assign({}, responseData, {
          'id': data.id,
        }));
      });

      event.subscribe( 'request.listening', sendRequest );

      server.listen( port );
    });

    it( 'should send a response with the defined status code', done => {
      const sendRequest = async () => {
        try {
          const response = await fetch( `http://localhost:${port}/hello-world` );

          expect( response.status ).to.equal( statusCode );

          server.close();
          done();
        } catch ( error ) {
          server.close();
          done( error );
        }
      };

      event.subscribe( 'request.received', data => {
        event.publish( 'response.send', Object.assign({}, responseData, {
          'id': data.id,
        }));
      });

      event.subscribe( 'request.listening', sendRequest );

      server.listen( port );
    });
  });

  describe( 'close()', () => {
    it( 'should send a 503 response for all open requests', done => {
      const sendRequest = async () => {
        try {
          const response = await fetch( `http://localhost:${port}/hello-world` );

          expect( response.status ).to.equal( 503 );

          server.close();
          done();
        } catch ( error ) {
          server.close();
          done( error );
        }
      };

      event.subscribe( 'request.received', () => {
        server.close();
      });

      event.subscribe( 'request.listening', sendRequest );

      server.listen( port );
    });
  });
});
