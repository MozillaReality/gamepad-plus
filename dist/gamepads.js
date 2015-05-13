(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gamepads = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsJs = require('./utils.js');

var _utilsJs2 = _interopRequireDefault(_utilsJs);

var utils = new _utilsJs2['default']();

var DEFAULT_CONFIG = {
  'axisThreshold': 0.15,
  'gamepadAttributesEnabled': true,
  'gamepadIndicesEnabled': true,
  'keyEventsEnabled': true,
  'nonstandardEventsEnabled': true,
  'indices': {},
  'keyEvents': {}
};

var DEFAULT_STATE = {
  buttons: new Array(17),
  axes: [0, 0, 0, 0]
};

for (var i = 0; i < 17; i++) {
  DEFAULT_STATE.buttons[i] = {
    pressed: false,
    value: 0
  };
}

var Gamepads = (function () {
  function Gamepads(config) {
    var _this = this;

    _classCallCheck(this, Gamepads);

    this.polyfill();

    this._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
    this._gamepadEvents = ['gamepadconnected', 'gamepaddisconnected'];
    this._seenEvents = {};

    this.dataSource = this.getGamepadDataSource();
    this.gamepadsSupported = this._hasGamepads();
    this.indices = {};
    this.previousState = {};
    this.state = {};

    var addSeenEvent = function addSeenEvent(e) {
      _this.addSeenEvent(e.gamepad, e);
    };

    this._gamepadEvents.forEach(function (eventName) {
      window.addEventListener(eventName, addSeenEvent);
    });

    config = config || {};
    Object.keys(DEFAULT_CONFIG).forEach(function (key) {
      _this[key] = key in config ? utils.clone(config[key]) : DEFAULT_CONFIG[key];
    });
  }

  _createClass(Gamepads, [{
    key: 'polyfill',
    value: function polyfill() {
      if (this._polyfilled) {
        return;
      }

      if (!('performance' in window)) {
        window.performance = {};
      }

      if (!('now' in window.performance)) {
        window.performance.now = function () {
          return +new Date();
        };
      }

      if (!('GamepadButton' in window)) {
        var GamepadButton = window.GamepadButton = function (obj) {
          return {
            pressed: obj.pressed,
            value: obj.value
          };
        };
      }

      this._polyfilled = true;
    }
  }, {
    key: '_getVendorProductIds',
    value: function _getVendorProductIds(gamepad) {
      var bits = gamepad.id.split('-');
      var match;

      if (bits.length < 2) {
        match = gamepad.id.match(/vendor: (\w+) product: (\w+)/i);
        if (match) {
          return match.slice(1).map(utils.stripLeadingZeros);
        }
      }

      match = gamepad.id.match(/(\w+)-(\w+)/);
      if (match) {
        return match.slice(1).map(utils.stripLeadingZeros);
      }

      return bits.slice(0, 2).map(utils.stripLeadingZeros);
    }
  }, {
    key: '_hasGamepads',
    value: function _hasGamepads() {
      for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
        if (this._gamepadApis[i] in navigator) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: '_getGamepads',
    value: function _getGamepads() {
      for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
        if (this._gamepadApis[i] in navigator) {
          return navigator[this._gamepadApis[i]]();
        }
      }
      return [];
    }
  }, {
    key: 'updateGamepad',
    value: function updateGamepad(gamepad) {
      gamepad = gamepad || DEFAULT_STATE;

      this.previousState[gamepad.index] = utils.clone(this.state[gamepad.index] || DEFAULT_STATE);
      this.state[gamepad.index] = utils.clone(gamepad);

      if (!this.hasSeenEvent(gamepad, { type: 'gamepadconnected' })) {
        this.fireConnectionEvent(gamepad, true);
      }
    }
  }, {
    key: 'existsGamepad',
    value: function existsGamepad(gamepad) {
      return gamepad.index in this.state;
    }
  }, {
    key: 'removeGamepad',
    value: function removeGamepad(gamepad) {
      delete this.state[gamepad.index];

      if (!this.hasSeenEvent(gamepad, { type: 'gamepaddisconnected' })) {
        this.removeSeenEvent(gamepad, { type: 'gamepadconnected' });
        this.fireConnectionEvent(gamepad, false);
      }
    }
  }, {
    key: 'observeButtonChanges',
    value: function observeButtonChanges(gamepad) {
      var _this2 = this;

      var previousPad = this.previousState[gamepad.index];
      var currentPad = this.state[gamepad.index];

      if (!previousPad || !Object.keys(previousPad).length || !currentPad || !Object.keys(currentPad).length) {
        return;
      }

      currentPad.buttons.forEach(function (button, buttonIdx) {
        if (button.value !== previousPad.buttons[buttonIdx].value) {
          // Fire non-standard events, if needed.
          _this2.fireButtonEvent(currentPad, buttonIdx, button.value);

          // Fire synthetic keyboard events, if needed.
          _this2.fireKeyEvent(currentPad, buttonIdx, button.value);
        }
      });
    }
  }, {
    key: 'observeAxisChanges',
    value: function observeAxisChanges(gamepad) {
      var _this3 = this;

      var previousPad = this.previousState[gamepad.index];
      var currentPad = this.state[gamepad.index];

      if (!previousPad || !Object.keys(previousPad).length || !currentPad || !Object.keys(currentPad).length) {
        return;
      }

      currentPad.axes.forEach(function (axis, axisIdx) {
        // Fire non-standard events, if needed.
        if (axis !== previousPad.axes[axisIdx]) {
          _this3.fireAxisMoveEvent(currentPad, axisIdx, axis);
        }
      });
    }
  }, {
    key: 'update',

    /**
     * @function
     * @name Gamepads#update
     * @description
     *   Update the current and previous states of the gamepads.
     *   This must be called every frame for events to work.
     */
    value: function update() {
      var _this4 = this;

      var previousPad;
      var currentPad;

      this.poll().forEach(function (pad) {
        // Add/update connected gamepads (and fire polyfilled events, if needed).
        _this4.updateGamepad(pad);

        // Fire polyfilled non-standard events, if needed.
        _this4.observeButtonChanges(pad);
        _this4.observeAxisChanges(pad);
      });

      Object.keys(this.previousState).forEach(function (padIdx) {
        previousPad = _this4.previousState[padIdx];
        currentPad = _this4.state[padIdx];

        // Remove disconnected gamepads (and fire polyfilled events, if needed).
        if (previousPad && _this4.existsGamepad(previousPad) && !_this4.existsGamepad(currentPad)) {

          _this4.removeGamepad(previousPad);
        }
      });
    }
  }, {
    key: 'getGamepadDataSource',

    /**
     * @function
     * @name Gamepads#getGamepadDataSource
     * @description Get gamepad data source (e.g., linuxjoy, hid, dinput, xinput).
     * @returns {String} A string of gamepad data source.
     */
    value: function getGamepadDataSource() {
      var dataSource;
      if (navigator.platform.match(/^Linux/)) {
        dataSource = 'linuxjoy';
      } else if (navigator.platform.match(/^Mac/)) {
        dataSource = 'hid';
      } else if (navigator.platform.match(/^Win/)) {
        var m = navigator.userAgent.match('Gecko/(..)');
        if (m && parseInt(m[1]) < 32) {
          dataSource = 'dinput';
        } else {
          dataSource = 'hid';
        }
      }
      return dataSource;
    }
  }, {
    key: 'poll',

    /**
     * @function
     * @name Gamepads#poll
     * @description Poll for the latest data from the gamepad API.
     * @returns {Array} An array of gamepads and mappings for the model of the connected gamepad.
     * @example
     *   var gamepads = new Gamepads();
     *   var pads = gamepads.poll();
     */
    value: function poll() {
      var pads = [];

      if (this.gamepadsSupported) {
        var padsRaw = this._getGamepads();
        var pad;

        for (var i = 0, len = padsRaw.length; i < len; i++) {
          pad = padsRaw[i];

          if (!pad) {
            continue;
          }

          pad = this.extend(pad);

          pads.push(pad);
        }
      }

      return pads;
    }
  }, {
    key: 'extend',

    /**
     * @function
     * @name Gamepads#extend
     * @description Set new properties on a gamepad object.
     * @param {Object} gamepad The original gamepad object.
     * @returns {Object} An extended copy of the gamepad.
     */
    value: function extend(gamepad) {
      if (gamepad._extended) {
        return gamepad;
      }

      var pad = utils.clone(gamepad);

      pad._extended = true;

      if (this.gamepadAttributesEnabled) {
        pad.attributes = this._getAttributes(pad);
      }

      if (!pad.timestamp) {
        pad.timestamp = window.performance.now();
      }

      if (this.gamepadIndicesEnabled) {
        pad.indices = this._getIndices(pad);
      }

      return pad;
    }
  }, {
    key: '_getAttributes',

    /**
     * @function
     * @name Gamepads#_getAttributes
     * @description Generate and return the attributes of a gamepad.
     * @param {Object} gamepad The gamepad object.
     * @returns {Object} The attributes for this gamepad.
     */
    value: function _getAttributes(gamepad) {
      var padIds = this._getVendorProductIds(gamepad);
      return {
        vendorId: padIds[0],
        productId: padIds[1],
        name: gamepad.id,
        dataSource: this.dataSource
      };
    }
  }, {
    key: '_getIndices',

    /**
     * @function
     * @name Gamepads#_getIndices
     * @description Return the named indices of a gamepad.
     * @param {Object} gamepad The gamepad object.
     * @returns {Object} The named indices for this gamepad.
     */
    value: function _getIndices(gamepad) {
      return this.indices[gamepad.id] || this.indices.standard || {};
    }
  }, {
    key: '_mapAxis',

    /**
     * @function
     * @name Gamepads#_mapAxis
     * @description Set the value for one of the analogue axes of the pad.
     * @param {Number} axis The button to get the value of.
     * @returns {Number} The value of the axis between -1 and 1.
     */
    value: function _mapAxis(axis) {
      if (Math.abs(axis) < this.axisThreshold) {
        return 0;
      }

      return axis;
    }
  }, {
    key: '_mapButton',

    /**
     * @function
     * @name Gamepads#_mapButton
     * @description Set the value for one of the buttons of the pad.
     * @param {Number} button The button to get the value of.
     * @returns {Object} An object resembling a `GamepadButton` object.
     */
    value: function _mapButton(button) {
      if (typeof button === 'number') {
        // Old versions of the API used to return just numbers instead
        // of `GamepadButton` objects.
        button = new GamepadButton({
          pressed: button === 1,
          value: button
        });
      }

      return button;
    }
  }, {
    key: 'setIndices',
    value: function setIndices(indices) {
      this.indices = utils.clone(indices);
    }
  }, {
    key: 'fireConnectionEvent',
    value: function fireConnectionEvent(gamepad, connected) {
      var name = connected ? 'gamepadconnected' : 'gamepaddisconnected';
      var data = {
        bubbles: false,
        cancelable: false,
        detail: {
          gamepad: gamepad
        }
      };
      utils.triggerEvent(window, name, data);
    }
  }, {
    key: 'fireKeyEvent',
    value: function fireKeyEvent(gamepad, button, value) {
      if (!this.keyEventsEnabled) {
        return;
      }

      var buttonName = utils.swap(gamepad.indices)[button];

      var names = value === 1 ? ['keydown', 'keypress'] : ['keyup'];
      var data = this.keyEvents[buttonName];

      if (data) {
        if (!('bubbles' in data)) {
          data.bubbles = true;
        }
        if (!data.detail) {
          data.detail = {};
        }
        data.detail.button = button;
        data.detail.gamepad = gamepad;

        names.forEach(function (name) {
          utils.triggerEvent(data.target || document.activeElement, name, data);
        });
      }
    }
  }, {
    key: 'fireButtonEvent',
    value: function fireButtonEvent(gamepad, button, value) {
      if (!this.nonstandardEventsEnabled || 'GamepadButtonEvent' in window) {
        return;
      }

      var name = value === 1 ? 'gamepadbuttondown' : 'gamepadbuttonup';
      var data = {
        bubbles: false,
        cancelable: false,
        detail: {
          button: button,
          gamepad: gamepad
        }
      };
      utils.triggerEvent(window, name, data);
    }
  }, {
    key: 'fireAxisMoveEvent',
    value: function fireAxisMoveEvent(gamepad, axis, value) {
      if (!this.nonstandardEventsEnabled || 'GamepadAxisMoveEvent' in window) {
        return;
      }

      if (Math.abs(value) < this.axisThreshold) {
        return;
      }

      var data = {
        bubbles: false,
        cancelable: false,
        detail: {
          axis: axis,
          gamepad: gamepad,
          value: value
        }
      };
      utils.triggerEvent(window, 'gamepadaxismove', data);
    }
  }, {
    key: 'addSeenEvent',
    value: function addSeenEvent(gamepad, e) {
      if (typeof this._seenEvents[gamepad.index] === 'undefined') {
        this._seenEvents[gamepad.index] = {};
      }

      this._seenEvents[gamepad.index][e.type] = e;
    }
  }, {
    key: 'hasSeenEvent',
    value: function hasSeenEvent(gamepad, e) {
      if (this._seenEvents[gamepad.index]) {
        return e.type in this._seenEvents[gamepad.index];
      }

      return false;
    }
  }, {
    key: 'removeSeenEvent',
    value: function removeSeenEvent(gamepad, e) {
      if (e.type) {
        if (this._seenEvents[gamepad.index]) {
          delete this._seenEvents[gamepad.index][e.type];
        }
      } else {
        delete this._seenEvents[gamepad.index];
      }
    }
  }, {
    key: 'buttonEvent2axisEvent',
    value: function buttonEvent2axisEvent(e) {
      if (e.type === 'gamepadbuttondown') {
        e.axis = e.button;
        e.value = 1;
      } else if (e.type === 'gamepadbuttonup') {
        e.axis = e.button;
        e.value = 0;
      }
      return e;
    }
  }]);

  return Gamepads;
})();

exports['default'] = Gamepads;

Gamepads.utils = utils;
module.exports = exports['default'];

},{"./utils.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Utils = (function () {
  function Utils() {
    _classCallCheck(this, Utils);

    this.browser = this.getBrowser();
    this.engine = this.getEngine(this.browser);
  }

  _createClass(Utils, [{
    key: 'clone',
    value: function clone(obj) {
      if (obj === null || !(obj instanceof Object)) {
        return obj;
      }

      var ret;

      if (obj instanceof Date) {
        ret = new Date();
        ret.setTime(obj.getTime());
        return ret;
      }

      if (obj instanceof Array) {
        ret = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          ret[i] = this.clone(obj[i]);
        }
        return ret;
      }

      if (obj instanceof Object) {
        ret = {};
        for (var attr in obj) {
          if (attr in obj) {
            ret[attr] = this.clone(obj[attr]);
          }
        }
        return ret;
      }

      throw new Error('Unable to clone object of unexpected type!');
    }
  }, {
    key: 'swap',
    value: function swap(obj) {
      var ret = {};
      for (var attr in obj) {
        if (attr in obj) {
          ret[obj[attr]] = attr;
        }
      }
      return ret;
    }
  }, {
    key: 'getBrowser',
    value: function getBrowser() {
      if (typeof window === 'undefined') {
        return;
      }

      if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera).
        return 'opera';
      } else if ('chrome' in window) {
        // Chrome 1+.
        return 'chrome';
      } else if (typeof InstallTrigger !== 'undefined') {
        // Firefox 1.0+.
        return 'firefox';
      } else if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        // At least Safari 3+: "[object HTMLElementConstructor]".
        return 'safari';
      } else if ( /*@cc_on!@*/false || !!document.documentMode) {
        // At least IE6.
        return 'ie';
      }
    }
  }, {
    key: 'getEngine',
    value: function getEngine(browser) {
      browser = browser || this.getBrowser();

      if (browser === 'firefox') {
        return 'gecko';
      } else if (browser === 'opera' || browser === 'chrome' || browser === 'safari') {
        return 'webkit';
      } else if (browser === 'ie') {
        return 'trident';
      }
    }
  }, {
    key: 'stripLeadingZeros',
    value: function stripLeadingZeros(str) {
      if (typeof str !== 'string') {
        return str;
      }
      return str.replace(/^0+(?=\d+)/g, '');
    }
  }, {
    key: 'triggerEvent',
    value: function triggerEvent(el, name, data) {
      data = data || {};
      data.detail = data.detail || {};

      var event;

      if ('CustomEvent' in window) {
        event = new CustomEvent(name, data);
      } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(name, data.bubbles, data.cancelable, data.detail);
      }

      Object.keys(data.detail).forEach(function (key) {
        event[key] = data.detail[key];
      });

      el.dispatchEvent(event);
    }
  }]);

  return Utils;
})();

exports['default'] = Utils;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libGamepadsJs = require('./lib/gamepads.js');

var _libGamepadsJs2 = _interopRequireDefault(_libGamepadsJs);

exports['default'] = _libGamepadsJs2['default'];
module.exports = exports['default'];

},{"./lib/gamepads.js":1}]},{},[3])(3)
});