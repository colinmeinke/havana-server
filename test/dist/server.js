/* global describe beforeEach it */

'use strict';

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _distServer = require('../../dist/server');

var _distServer2 = _interopRequireDefault(_distServer);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _havanaEvent = require('havana-event');

var _havanaEvent2 = _interopRequireDefault(_havanaEvent);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

require('gulp-babel/node_modules/babel-core/polyfill');

var expect = _chai2['default'].expect;
var port = 3000;

var event = undefined;
var server = undefined;

describe('Server', function () {
  beforeEach(function () {
    event = new _havanaEvent2['default']();

    server = new _distServer2['default']({
      'event': event,
      'reporting': {
        'level': 0,
        'reporter': console.log
      }
    });
  });

  describe('_', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('_');
    });
  });

  describe('event', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('event');
    });
  });

  describe('handlers', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('handlers');
    });
  });

  describe('id', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('id');
    });

    it('should be incremented on each request received', function (done) {
      var id = null;

      event.subscribe('request.received', function (data) {
        expect(data.id).to.not.equal(id);

        if (id) {
          server.close();
          done();
        }

        id = data.id;
      });

      event.subscribe('request.listening', function () {
        (0, _nodeFetch2['default'])('http://localhost:' + port + '/hello');
        (0, _nodeFetch2['default'])('http://localhost:' + port + '/world');
      });

      server.listen(port);
    });
  });

  describe('reporting', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('reporting');
    });
  });

  describe('requests', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('requests');
    });
  });

  describe('server', function () {
    it('should be private', function () {
      expect(server).to.not.have.property('server');
    });
  });

  describe('request.listening', function () {
    it('should be published when server is ready to dispatch', function (done) {
      event.subscribe('request.listening', function () {
        server.close();
        done();
      });

      server.listen(port);
    });
  });

  describe('request.received', function () {
    it('should be published when server receives a request', function (done) {
      event.subscribe('request.received', function () {
        server.close();
        done();
      });

      event.subscribe('request.listening', function () {
        (0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world');
      });

      server.listen(port);
    });
  });

  describe('response.error', function () {
    it('should be published when all registered handlers have failed to handle a request', function (done) {
      event.subscribe('response.error', function () {
        server.close();
        done();
      });

      event.publish('response.handler.register', {
        'name': 'hello'
      });

      event.subscribe('request.received', function (data) {
        event.publish('response.handler.error', {
          'id': data.id,
          'name': 'hello'
        });
      });

      event.subscribe('request.listening', function () {
        (0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world');
      });

      server.listen(port);
    });
  });

  describe('response.send', function () {
    var content = 'Hello world';
    var contentType = 'text/plain';
    var statusCode = 200;

    var responseData = {
      'content': content,
      'contentType': contentType,
      'statusCode': statusCode
    };

    it('should send a response with the defined content', function (done) {
      var sendRequest = function sendRequest() {
        var response, responseContent;
        return regeneratorRuntime.async(function sendRequest$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.prev = 0;
              context$4$0.next = 3;
              return regeneratorRuntime.awrap((0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world'));

            case 3:
              response = context$4$0.sent;
              context$4$0.next = 6;
              return regeneratorRuntime.awrap(response.text());

            case 6:
              responseContent = context$4$0.sent;

              expect(responseContent).to.equal(content);

              server.close();
              done();
              context$4$0.next = 16;
              break;

            case 12:
              context$4$0.prev = 12;
              context$4$0.t0 = context$4$0['catch'](0);

              server.close();
              done(context$4$0.t0);

            case 16:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[0, 12]]);
      };

      event.subscribe('request.received', function (data) {
        event.publish('response.send', Object.assign({}, responseData, {
          'id': data.id
        }));
      });

      event.subscribe('request.listening', sendRequest);

      server.listen(port);
    });

    it('should send a response with the defined Content-Type header', function (done) {
      var sendRequest = function sendRequest() {
        var response;
        return regeneratorRuntime.async(function sendRequest$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.prev = 0;
              context$4$0.next = 3;
              return regeneratorRuntime.awrap((0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world'));

            case 3:
              response = context$4$0.sent;

              expect(response.headers.get('Content-Type')).to.equal(contentType);

              server.close();
              done();
              context$4$0.next = 13;
              break;

            case 9:
              context$4$0.prev = 9;
              context$4$0.t0 = context$4$0['catch'](0);

              server.close();
              done(context$4$0.t0);

            case 13:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[0, 9]]);
      };

      event.subscribe('request.received', function (data) {
        event.publish('response.send', Object.assign({}, responseData, {
          'id': data.id
        }));
      });

      event.subscribe('request.listening', sendRequest);

      server.listen(port);
    });

    it('should send a response with the defined status code', function (done) {
      var sendRequest = function sendRequest() {
        var response;
        return regeneratorRuntime.async(function sendRequest$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.prev = 0;
              context$4$0.next = 3;
              return regeneratorRuntime.awrap((0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world'));

            case 3:
              response = context$4$0.sent;

              expect(response.status).to.equal(statusCode);

              server.close();
              done();
              context$4$0.next = 13;
              break;

            case 9:
              context$4$0.prev = 9;
              context$4$0.t0 = context$4$0['catch'](0);

              server.close();
              done(context$4$0.t0);

            case 13:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[0, 9]]);
      };

      event.subscribe('request.received', function (data) {
        event.publish('response.send', Object.assign({}, responseData, {
          'id': data.id
        }));
      });

      event.subscribe('request.listening', sendRequest);

      server.listen(port);
    });
  });

  describe('close()', function () {
    it('should send a 503 response for all open requests', function (done) {
      var sendRequest = function sendRequest() {
        var response;
        return regeneratorRuntime.async(function sendRequest$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.prev = 0;
              context$4$0.next = 3;
              return regeneratorRuntime.awrap((0, _nodeFetch2['default'])('http://localhost:' + port + '/hello-world'));

            case 3:
              response = context$4$0.sent;

              expect(response.status).to.equal(503);

              server.close();
              done();
              context$4$0.next = 13;
              break;

            case 9:
              context$4$0.prev = 9;
              context$4$0.t0 = context$4$0['catch'](0);

              server.close();
              done(context$4$0.t0);

            case 13:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[0, 9]]);
      };

      event.subscribe('request.received', function () {
        server.close();
      });

      event.subscribe('request.listening', sendRequest);

      server.listen(port);
    });
  });
});