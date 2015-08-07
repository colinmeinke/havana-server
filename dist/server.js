'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _ = new WeakMap();

var Server = (function () {
  function Server(config) {
    _classCallCheck(this, Server);

    var props = {
      'event': config.event,
      'handlers': [],
      'id': 1,
      'reporting': config.reporting,
      'requests': new Map(),
      'server': null
    };

    _.set(this, props);

    this.init();
  }

  _createClass(Server, [{
    key: 'init',
    value: function init() {
      var _$get = _.get(this);

      var event = _$get.event;
      var handlers = _$get.handlers;
      var requests = _$get.requests;

      event.subscribe('response.handler.register', function (data) {
        handlers.push(data.name);
      });

      event.subscribe('response.handler.error', function (data) {
        var request = requests.get(data.id);

        if (request) {
          request.handlerErrors++;

          if (request.handlerErrors === handlers.length) {
            event.publish('response.error', data);
          }
        }
      });

      event.subscribe('response.send', function (data) {
        var request = requests.get(data.id);

        request.response.statusCode = data.statusCode;

        if (data.content) {
          request.response.setHeader('Content-Type', data.contentType);
          request.response.write(data.content);
        }

        request.response.end();

        requests['delete'](data.id);
      });
    }
  }, {
    key: 'listen',
    value: function listen(port) {
      var _this = this;

      var _$get2 = _.get(this);

      var event = _$get2.event;
      var reporting = _$get2.reporting;
      var requests = _$get2.requests;
      var server = _$get2.server;

      if (!server) {
        _.get(this).server = _http2['default'].createServer(function (request, response) {
          var requestId = _.get(_this).id++;

          requests.set(requestId, {
            'handlerErrors': 0,
            'response': response
          });

          if (reporting.level > 0) {
            reporting.reporter('-- ' + request.method + ' request received: ' + request.url);
          }

          event.publish('request.received', {
            'id': requestId,
            'method': request.method,
            'time': Date.now(),
            'url': request.url
          });
        });

        _.get(this).server.listen(port, function () {
          if (reporting.level > 0) {
            reporting.reporter('-- Listening for requests on http://localhost:' + port);
          }

          event.publish('request.listening', {
            'location': 'http://localhost:' + port
          });
        });
      }
    }
  }, {
    key: 'close',
    value: function close() {
      var _$get3 = _.get(this);

      var event = _$get3.event;
      var requests = _$get3.requests;
      var server = _$get3.server;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {

        for (var _iterator = requests.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          event.publish('response.send', {
            'id': id,
            'statusCode': 503,
            'time': Date.now()
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (server) {
        server.close();
      }
    }
  }]);

  return Server;
})();

exports['default'] = Server;
module.exports = exports['default'];