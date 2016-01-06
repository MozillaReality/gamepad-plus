(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gamepads = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libGamepadsJs = require('./lib/gamepads.js');

var _libGamepadsJs2 = _interopRequireDefault(_libGamepadsJs);

exports['default'] = _libGamepadsJs2['default'];
module.exports = exports['default'];

},{"./lib/gamepads.js":3}],2:[function(require,module,exports){
/**
 * A simple event-emitter class. Like Node's but much simpler.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = (function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this._listeners = {};
  }

  _createClass(EventEmitter, [{
    key: "emit",
    value: function emit(name) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // console.log('emit', name, args, this._listeners);
      (this._listeners[name] || []).forEach(function (func) {
        return func.apply(_this, args);
      });
      return this;
    }
  }, {
    key: "on",
    value: function on(name, func) {
      if (name in this._listeners) {
        this._listeners[name].push(func);
      } else {
        this._listeners[name] = [func];
      }
      return this;
    }
  }, {
    key: "off",
    value: function off(name) {
      if (name) {
        this._listeners[name] = [];
      } else {
        this._listeners = {};
      }
      return this;
    }
  }]);

  return EventEmitter;
})();

exports["default"] = EventEmitter;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _event_emitterJs = require('./event_emitter.js');

var _event_emitterJs2 = _interopRequireDefault(_event_emitterJs);

var _utilsJs = require('./utils.js');

var _utilsJs2 = _interopRequireDefault(_utilsJs);

var utils = new _utilsJs2['default']();

var DEFAULT_CONFIG = {
  'axisThreshold': 0.15,
  'gamepadAttributesEnabled': true,
  'gamepadIndicesEnabled': true,
  'keyEventsEnabled': true,
  'nonstandardEventsEnabled': true,
  'indices': undefined,
  'keyEvents': undefined
};

var DEFAULT_STATE = {
  // The standard gamepad has 4 axes and 17 buttons.
  // Some gamepads have 5-6 axes and 18-20 buttons.
  buttons: new Array(20),
  axes: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
};

for (var i = 0; i < 20; i++) {
  DEFAULT_STATE.buttons[i] = {
    pressed: false,
    value: 0.0
  };
}

var Gamepads = (function (_EventEmitter) {
  _inherits(Gamepads, _EventEmitter);

  function Gamepads(config) {
    var _this = this;

    _classCallCheck(this, Gamepads);

    _get(Object.getPrototypeOf(Gamepads.prototype), 'constructor', this).call(this);

    this.polyfill();

    this._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
    this._gamepadDOMEvents = ['gamepadconnected', 'gamepaddisconnected'];
    this._gamepadInternalEvents = ['gamepadconnected', 'gamepaddisconnected', 'gamepadbuttondown', 'gamepadbuttonup', 'gamepadaxismove'];
    this._seenEvents = {};

    this.dataSource = this.getGamepadDataSource();
    this.gamepadsSupported = this._hasGamepads();
    this.indices = {};
    this.keyEvents = {};
    this.previousState = {};
    this.state = {};

    // Mark the events we see (keyed off gamepad index)
    // so we don't fire the same event twice.
    this._gamepadDOMEvents.forEach(function (eventName) {
      window.addEventListener(eventName, function (e) {
        _this.addSeenEvent(e.gamepad, eventName, 'dom');

        // Let the events fire again, if they've been disconnected/reconnected.
        if (eventName === 'gamepaddisconnected') {
          _this.removeSeenEvent(e.gamepad, 'gamepadconnected', 'dom');
        } else if (eventName === 'gamepadconnected') {
          _this.removeSeenEvent(e.gamepad, 'gamepaddisconnected', 'dom');
        }
      });
    });
    this._gamepadInternalEvents.forEach(function (eventName) {
      _this.on(eventName, function (gamepad) {
        _this.addSeenEvent(gamepad, eventName, 'internal');

        if (eventName === 'gamepaddisconnected') {
          _this.removeSeenEvent(gamepad, 'gamepadconnected', 'internal');
        } else {
          _this.removeSeenEvent(gamepad, 'gamepaddisconnected', 'internal');
        }
      });
    });

    config = config || {};
    Object.keys(DEFAULT_CONFIG).forEach(function (key) {
      _this[key] = typeof config[key] === 'undefined' ? DEFAULT_CONFIG[key] : utils.clone(config[key]);
    });

    if (this.gamepadIndicesEnabled) {
      this.on('gamepadconnected', this._onGamepadConnected.bind(this));
      this.on('gamepaddisconnected', this._onGamepadDisconnected.bind(this));
      this.on('gamepadbuttondown', this._onGamepadButtonDown.bind(this));
      this.on('gamepadbuttonup', this._onGamepadButtonUp.bind(this));
      this.on('gamepadaxismove', this._onGamepadAxisMove.bind(this));
    }
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
      this.previousState[gamepad.index] = utils.clone(this.state[gamepad.index] || DEFAULT_STATE);
      this.state[gamepad.index] = gamepad ? utils.clone(gamepad) : DEFAULT_STATE;

      // Fire connection event, if gamepad was actually connected.
      this.fireConnectionEvent(this.state[gamepad.index], true);
    }
  }, {
    key: 'removeGamepad',
    value: function removeGamepad(gamepad) {
      delete this.state[gamepad.index];

      // Fire disconnection event.
      this.fireConnectionEvent(gamepad, false);
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
          // Fire button events.
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
        // Fire axis events.
        if (axis !== previousPad.axes[axisIdx]) {
          _this3.fireAxisMoveEvent(currentPad, axisIdx, axis);
        }
      });
    }

    /**
     * @function
     * @name Gamepads#update
     * @description
     *   Update the current and previous states of the gamepads.
     *   This must be called every frame for events to work.
     */
  }, {
    key: 'update',
    value: function update() {
      var _this4 = this;

      var activePads = {};

      this.poll().forEach(function (pad) {
        // Keep track of which gamepads are still active (not disconnected).
        activePads[pad.index] = true;

        // Add/update connected gamepads
        // (and fire internal events + polyfilled events, if needed).
        _this4.updateGamepad(pad);

        // Never seen this actually be the case, but if a pad is still in the
        // `navigator.getGamepads()` list and it's disconnected, emit the event.
        if (!pad.connected) {
          _this4.removeGamepad(_this4.state[padIdx]);
        }

        // Fire internal events + polyfilled non-standard events, if needed.
        _this4.observeButtonChanges(pad);
        _this4.observeAxisChanges(pad);
      });

      Object.keys(this.state).forEach(function (padIdx) {
        if (!(padIdx in activePads)) {
          // Remove disconnected gamepads
          // (and fire internal events + polyfilled events, if needed).
          _this4.removeGamepad(_this4.state[padIdx]);
        }
      });
    }

    /**
     * @function
     * @name Gamepads#getGamepadDataSource
     * @description Get gamepad data source (e.g., linuxjoy, hid, dinput, xinput).
     * @returns {String} A string of gamepad data source.
     */
  }, {
    key: 'getGamepadDataSource',
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

    /**
     * @function
     * @name Gamepads#poll
     * @description Poll for the latest data from the gamepad API.
     * @returns {Array} An array of gamepads and mappings for the model of the connected gamepad.
     * @example
     *   var gamepads = new Gamepads();
     *   var pads = gamepads.poll();
     */
  }, {
    key: 'poll',
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

    /**
     * @function
     * @name Gamepads#extend
     * @description Set new properties on a gamepad object.
     * @param {Object} gamepad The original gamepad object.
     * @returns {Object} An extended copy of the gamepad.
     */
  }, {
    key: 'extend',
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

    /**
     * @function
     * @name Gamepads#_getAttributes
     * @description Generate and return the attributes of a gamepad.
     * @param {Object} gamepad The gamepad object.
     * @returns {Object} The attributes for this gamepad.
     */
  }, {
    key: '_getAttributes',
    value: function _getAttributes(gamepad) {
      var padIds = this._getVendorProductIds(gamepad);
      return {
        vendorId: padIds[0],
        productId: padIds[1],
        name: gamepad.id,
        dataSource: this.dataSource
      };
    }

    /**
     * @function
     * @name Gamepads#_getIndices
     * @description Return the named indices of a gamepad.
     * @param {Object} gamepad The gamepad object.
     * @returns {Object} The named indices for this gamepad.
     */
  }, {
    key: '_getIndices',
    value: function _getIndices(gamepad) {
      return this.indices[gamepad.id] || this.indices.standard || {};
    }

    /**
     * @function
     * @name Gamepads#_mapAxis
     * @description Set the value for one of the analogue axes of the pad.
     * @param {Number} axis The button to get the value of.
     * @returns {Number} The value of the axis between -1 and 1.
     */
  }, {
    key: '_mapAxis',
    value: function _mapAxis(axis) {
      if (Math.abs(axis) < this.axisThreshold) {
        return 0;
      }

      return axis;
    }

    /**
     * @function
     * @name Gamepads#_mapButton
     * @description Set the value for one of the buttons of the pad.
     * @param {Number} button The button to get the value of.
     * @returns {Object} An object resembling a `GamepadButton` object.
     */
  }, {
    key: '_mapButton',
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

      if (!this.hasSeenEvent(gamepad, name, 'internal')) {
        // Fire internal event.
        this.emit(name, gamepad);
      }

      // Don't fire the 'gamepadconnected'/'gamepaddisconnected' events if the
      // browser has already fired them. (Unfortunately, we can't feature detect
      // if they'll get fired.)
      if (!this.hasSeenEvent(gamepad, name, 'dom')) {
        var data = {
          bubbles: false,
          cancelable: false,
          detail: {
            gamepad: gamepad
          }
        };

        utils.triggerEvent(window, name, data);
      }
    }
  }, {
    key: 'fireButtonEvent',
    value: function fireButtonEvent(gamepad, button, value) {
      var name = value === 1 ? 'gamepadbuttondown' : 'gamepadbuttonup';

      // Fire internal event.
      this.emit(name, gamepad, button, value);

      if (this.nonstandardEventsEnabled && !('GamepadButtonEvent' in window)) {
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
    }
  }, {
    key: 'fireAxisMoveEvent',
    value: function fireAxisMoveEvent(gamepad, axis, value) {
      var name = 'gamepadaxismove';

      // Fire internal event.
      this.emit(name, gamepad, axis, value);

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
      utils.triggerEvent(window, name, data);
    }
  }, {
    key: 'fireKeyEvent',
    value: function fireKeyEvent(gamepad, button, value) {
      if (!this.keyEventsEnabled || !this.keyEvents) {
        return;
      }

      var buttonName = utils.swap(gamepad.indices)[button];

      if (typeof buttonName === 'undefined') {
        return;
      }

      var names = value === 1 ? ['keydown', 'keypress'] : ['keyup'];
      var data = this.keyEvents[buttonName];

      if (!data) {
        return;
      }

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
  }, {
    key: 'addSeenEvent',
    value: function addSeenEvent(gamepad, eventType, namespace) {
      var key = [gamepad.index, eventType, namespace].join('.');

      this._seenEvents[key] = true;
    }
  }, {
    key: 'hasSeenEvent',
    value: function hasSeenEvent(gamepad, eventType, namespace) {
      var key = [gamepad.index, eventType, namespace].join('.');

      return !!this._seenEvents[key];
    }
  }, {
    key: 'removeSeenEvent',
    value: function removeSeenEvent(gamepad, eventType, namespace) {
      var key = [gamepad.index, eventType, namespace].join('.');

      delete this._seenEvents[key];
    }
  }, {
    key: 'buttonEvent2axisEvent',
    value: function buttonEvent2axisEvent(e) {
      if (e.type === 'gamepadbuttondown') {
        e.axis = e.button;
        e.value = 1.0;
      } else if (e.type === 'gamepadbuttonup') {
        e.axis = e.button;
        e.value = 0.0;
      }
      return e;
    }

    /**
     * Returns whether a `button` index equals the supplied `key`.
     *
     * Useful for determining whether ``navigator.getGamepads()[0].buttons[`$button`]``
     * has any bindings defined (in `FrameManager`).
     *
     * @param {Number} button Index of gamepad button (e.g., `4`).
     * @param {String} key Human-readable format for button binding (e.g., 'b4').
     */
  }, {
    key: '_buttonDownEqualsKey',
    value: function _buttonDownEqualsKey(button, key) {
      return 'b' + button + '.down' === key.trim().toLowerCase();
    }
  }, {
    key: '_buttonUpEqualsKey',
    value: function _buttonUpEqualsKey(button, key) {
      var keyClean = key.trim().toLowerCase();
      return 'b' + button + '.up' === keyClean || 'b' + button === keyClean;
    }

    /**
     * Returns whether an `axis` index equals the supplied `key`.
     *
     * Useful for determining whether ``navigator.getGamepads()[0].axes[`$button`]``
     * has any bindings defined (in `FrameManager`).
     *
     * @param {Number} button Index of gamepad axis (e.g., `1`).
     * @param {String} key Human-readable format for button binding (e.g., 'a1').
     */
  }, {
    key: '_axisMoveEqualsKey',
    value: function _axisMoveEqualsKey(axis, key) {
      return 'a' + axis === key.trim().toLowerCase();
    }

    /**
     * Calls any bindings defined for 'connected' (in `FrameManager`).
     *
     * (Called by event listener for `gamepadconnected`.)
     *
     * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
     */
  }, {
    key: '_onGamepadConnected',
    value: function _onGamepadConnected(gamepad) {
      if ('connected' in gamepad.indices) {
        gamepad.indices.connected(gamepad);
      }
    }

    /**
     * Calls any bindings defined for 'disconnected' (in `FrameManager`).
     *
     * (Called by event listener for `gamepadconnected`.)
     *
     * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
     */
  }, {
    key: '_onGamepadDisconnected',
    value: function _onGamepadDisconnected(gamepad) {
      if ('disconnected' in gamepad.indices) {
        gamepad.indices.disconnected(gamepad);
      }
    }

    /**
     * Calls any bindings defined for buttons (e.g., 'b4.up' in `FrameManager`).
     *
     * (Called by event listener for `gamepadconnected`.)
     *
     * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
     * @param {Number} button Index of gamepad button (integer) being pressed
     *                        (per `gamepadbuttondown` event).
     */
  }, {
    key: '_onGamepadButtonDown',
    value: function _onGamepadButtonDown(gamepad, button) {
      for (var key in gamepad.indices) {
        if (this._buttonDownEqualsKey(button, key)) {
          gamepad.indices[key](gamepad, button);
        }
      }
    }

    /**
     * Calls any bindings defined for buttons (e.g., 'b4.down' in `FrameManager`).
     *
     * (Called by event listener for `gamepadconnected`.)
     *
     * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
     * @param {Number} button Index of gamepad button (integer) being released
     *                        (per `gamepadbuttonup` event).
     */
  }, {
    key: '_onGamepadButtonUp',
    value: function _onGamepadButtonUp(gamepad, button) {
      for (var key in gamepad.indices) {
        if (this._buttonUpEqualsKey(button, key)) {
          gamepad.indices[key](gamepad, button);
        }
      }
    }

    /**
     * Calls any bindings defined for axes (e.g., 'a1' in `FrameManager`).
     *
     * (Called by event listener for `gamepadaxismove`.)
     *
     * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
     * @param {Number} axis Index of gamepad axis (integer) being changed
     *                      (per `gamepadaxismove` event).
     * @param {Number} value Value of gamepad axis (from -1.0 to 1.0) being
     *                       changed (per `gamepadaxismove` event).
     */
  }, {
    key: '_onGamepadAxisMove',
    value: function _onGamepadAxisMove(gamepad, axis, value) {
      for (var key in gamepad.indices) {
        if (this._axisMoveEqualsKey(axis, key)) {
          gamepad.indices[key](gamepad, axis, value);
        }
      }
    }
  }]);

  return Gamepads;
})(_event_emitterJs2['default']);

exports['default'] = Gamepads;

Gamepads.utils = utils;
module.exports = exports['default'];

},{"./event_emitter.js":2,"./utils.js":4}],4:[function(require,module,exports){
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
      if (obj === null || typeof obj === 'function' || !(obj instanceof Object)) {
        return obj;
      }

      var ret = '';

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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvb3B0L2dhbWVwYWQtcGx1cy9zcmMvaW5kZXguanMiLCIvb3B0L2dhbWVwYWQtcGx1cy9zcmMvbGliL2V2ZW50X2VtaXR0ZXIuanMiLCIvb3B0L2dhbWVwYWQtcGx1cy9zcmMvbGliL2dhbWVwYWRzLmpzIiwiL29wdC9nYW1lcGFkLXBsdXMvc3JjL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzZCQ0FxQixtQkFBbUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNJbkIsWUFBWTtBQUNwQixXQURRLFlBQVksR0FDakI7MEJBREssWUFBWTs7QUFFN0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7R0FDdEI7O2VBSGtCLFlBQVk7O1dBSzNCLGNBQUMsSUFBSSxFQUFXOzs7d0NBQU4sSUFBSTtBQUFKLFlBQUk7Ozs7QUFFaEIsT0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFFLE9BQU8sQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsS0FBSyxRQUFPLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQztBQUN0RSxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFQyxZQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDYixVQUFJLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQzNCLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2xDLE1BQU07QUFDTCxZQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDaEM7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFRSxhQUFDLElBQUksRUFBRTtBQUNSLFVBQUksSUFBSSxFQUFF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QUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7QUFFaEMsVUFBSSxLQUFLLENBQUM7O0FBRVYsVUFBSSxhQUFhLElBQUksTUFBTSxFQUFFO0FBQzNCLGFBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckMsTUFBTTtBQUNMLGFBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzVDLGFBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDekU7O0FBRUQsWUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ3hDLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQy9CLENBQUMsQ0FBQzs7QUFFSCxRQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCOzs7U0E5R2tCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBHYW1lcGFkcyBmcm9tICcuL2xpYi9nYW1lcGFkcy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVwYWRzO1xuIiwiLyoqXG4gKiBBIHNpbXBsZSBldmVudC1lbWl0dGVyIGNsYXNzLiBMaWtlIE5vZGUncyBidXQgbXVjaCBzaW1wbGVyLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICB9XG5cbiAgZW1pdChuYW1lLCAuLi5hcmdzKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2VtaXQnLCBuYW1lLCBhcmdzLCB0aGlzLl9saXN0ZW5lcnMpO1xuICAgICh0aGlzLl9saXN0ZW5lcnNbbmFtZV0gfHwgW10pLmZvckVhY2goZnVuYyA9PiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG9uKG5hbWUsIGZ1bmMpIHtcbiAgICBpZiAobmFtZSBpbiB0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVyc1tuYW1lXS5wdXNoKGZ1bmMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnNbbmFtZV0gPSBbZnVuY107XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgb2ZmKG5hbWUpIHtcbiAgICBpZiAobmFtZSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50X2VtaXR0ZXIuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xuXG5cbnZhciB1dGlscyA9IG5ldyBVdGlscygpO1xuXG5jb25zdCBERUZBVUxUX0NPTkZJRyA9IHtcbiAgJ2F4aXNUaHJlc2hvbGQnOiAwLjE1LFxuICAnZ2FtZXBhZEF0dHJpYnV0ZXNFbmFibGVkJzogdHJ1ZSxcbiAgJ2dhbWVwYWRJbmRpY2VzRW5hYmxlZCc6IHRydWUsXG4gICdrZXlFdmVudHNFbmFibGVkJzogdHJ1ZSxcbiAgJ25vbnN0YW5kYXJkRXZlbnRzRW5hYmxlZCc6IHRydWUsXG4gICdpbmRpY2VzJzogdW5kZWZpbmVkLFxuICAna2V5RXZlbnRzJzogdW5kZWZpbmVkXG59O1xuXG52YXIgREVGQVVMVF9TVEFURSA9IHtcbiAgLy8gVGhlIHN0YW5kYXJkIGdhbWVwYWQgaGFzIDQgYXhlcyBhbmQgMTcgYnV0dG9ucy5cbiAgLy8gU29tZSBnYW1lcGFkcyBoYXZlIDUtNiBheGVzIGFuZCAxOC0yMCBidXR0b25zLlxuICBidXR0b25zOiBuZXcgQXJyYXkoMjApLFxuICBheGVzOiBbMC4wLCAwLjAsIDAuMCwgMC4wLCAwLjAsIDAuMF1cbn07XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICBERUZBVUxUX1NUQVRFLmJ1dHRvbnNbaV0gPSB7XG4gICAgcHJlc3NlZDogZmFsc2UsXG4gICAgdmFsdWU6IDAuMFxuIH07XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZXBhZHMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wb2x5ZmlsbCgpO1xuXG4gICAgdGhpcy5fZ2FtZXBhZEFwaXMgPSBbJ2dldEdhbWVwYWRzJywgJ3dlYmtpdEdldEdhbWVwYWRzJywgJ3dlYmtpdEdhbWVwYWRzJ107XG4gICAgdGhpcy5fZ2FtZXBhZERPTUV2ZW50cyA9IFsnZ2FtZXBhZGNvbm5lY3RlZCcsICdnYW1lcGFkZGlzY29ubmVjdGVkJ107XG4gICAgdGhpcy5fZ2FtZXBhZEludGVybmFsRXZlbnRzID0gWydnYW1lcGFkY29ubmVjdGVkJywgJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLFxuICAgICAgJ2dhbWVwYWRidXR0b25kb3duJywgJ2dhbWVwYWRidXR0b251cCcsICdnYW1lcGFkYXhpc21vdmUnXTtcbiAgICB0aGlzLl9zZWVuRXZlbnRzID0ge307XG5cbiAgICB0aGlzLmRhdGFTb3VyY2UgPSB0aGlzLmdldEdhbWVwYWREYXRhU291cmNlKCk7XG4gICAgdGhpcy5nYW1lcGFkc1N1cHBvcnRlZCA9IHRoaXMuX2hhc0dhbWVwYWRzKCk7XG4gICAgdGhpcy5pbmRpY2VzID0ge307XG4gICAgdGhpcy5rZXlFdmVudHMgPSB7fTtcbiAgICB0aGlzLnByZXZpb3VzU3RhdGUgPSB7fTtcbiAgICB0aGlzLnN0YXRlID0ge307XG5cbiAgICAvLyBNYXJrIHRoZSBldmVudHMgd2Ugc2VlIChrZXllZCBvZmYgZ2FtZXBhZCBpbmRleClcbiAgICAvLyBzbyB3ZSBkb24ndCBmaXJlIHRoZSBzYW1lIGV2ZW50IHR3aWNlLlxuICAgIHRoaXMuX2dhbWVwYWRET01FdmVudHMuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBlID0+IHtcbiAgICAgICAgdGhpcy5hZGRTZWVuRXZlbnQoZS5nYW1lcGFkLCBldmVudE5hbWUsICdkb20nKTtcblxuICAgICAgICAvLyBMZXQgdGhlIGV2ZW50cyBmaXJlIGFnYWluLCBpZiB0aGV5J3ZlIGJlZW4gZGlzY29ubmVjdGVkL3JlY29ubmVjdGVkLlxuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZVNlZW5FdmVudChlLmdhbWVwYWQsICdnYW1lcGFkY29ubmVjdGVkJywgJ2RvbScpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gJ2dhbWVwYWRjb25uZWN0ZWQnKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVTZWVuRXZlbnQoZS5nYW1lcGFkLCAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsICdkb20nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fZ2FtZXBhZEludGVybmFsRXZlbnRzLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIHRoaXMub24oZXZlbnROYW1lLCBnYW1lcGFkID0+IHtcbiAgICAgICAgdGhpcy5hZGRTZWVuRXZlbnQoZ2FtZXBhZCwgZXZlbnROYW1lLCAnaW50ZXJuYWwnKTtcblxuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZVNlZW5FdmVudChnYW1lcGFkLCAnZ2FtZXBhZGNvbm5lY3RlZCcsICdpbnRlcm5hbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU2VlbkV2ZW50KGdhbWVwYWQsICdnYW1lcGFkZGlzY29ubmVjdGVkJywgJ2ludGVybmFsJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIE9iamVjdC5rZXlzKERFRkFVTFRfQ09ORklHKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICB0aGlzW2tleV0gPSB0eXBlb2YgY29uZmlnW2tleV0gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9DT05GSUdba2V5XSA6IHV0aWxzLmNsb25lKGNvbmZpZ1trZXldKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmdhbWVwYWRJbmRpY2VzRW5hYmxlZCkge1xuICAgICAgdGhpcy5vbignZ2FtZXBhZGNvbm5lY3RlZCcsIHRoaXMuX29uR2FtZXBhZENvbm5lY3RlZC5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMub24oJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLCB0aGlzLl9vbkdhbWVwYWREaXNjb25uZWN0ZWQuYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLm9uKCdnYW1lcGFkYnV0dG9uZG93bicsIHRoaXMuX29uR2FtZXBhZEJ1dHRvbkRvd24uYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLm9uKCdnYW1lcGFkYnV0dG9udXAnLCB0aGlzLl9vbkdhbWVwYWRCdXR0b25VcC5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMub24oJ2dhbWVwYWRheGlzbW92ZScsIHRoaXMuX29uR2FtZXBhZEF4aXNNb3ZlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHBvbHlmaWxsKCkge1xuICAgIGlmICh0aGlzLl9wb2x5ZmlsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoJ3BlcmZvcm1hbmNlJyBpbiB3aW5kb3cpKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoISgnbm93JyBpbiB3aW5kb3cucGVyZm9ybWFuY2UpKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gK25ldyBEYXRlKCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdHYW1lcGFkQnV0dG9uJyBpbiB3aW5kb3cpKSB7XG4gICAgICB2YXIgR2FtZXBhZEJ1dHRvbiA9IHdpbmRvdy5HYW1lcGFkQnV0dG9uID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByZXNzZWQ6IG9iai5wcmVzc2VkLFxuICAgICAgICAgIHZhbHVlOiBvYmoudmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5fcG9seWZpbGxlZCA9IHRydWU7XG4gIH1cblxuICBfZ2V0VmVuZG9yUHJvZHVjdElkcyhnYW1lcGFkKSB7XG4gICAgdmFyIGJpdHMgPSBnYW1lcGFkLmlkLnNwbGl0KCctJyk7XG4gICAgdmFyIG1hdGNoO1xuXG4gICAgaWYgKGJpdHMubGVuZ3RoIDwgMikge1xuICAgICAgbWF0Y2ggPSBnYW1lcGFkLmlkLm1hdGNoKC92ZW5kb3I6IChcXHcrKSBwcm9kdWN0OiAoXFx3KykvaSk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoLnNsaWNlKDEpLm1hcCh1dGlscy5zdHJpcExlYWRpbmdaZXJvcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWF0Y2ggPSBnYW1lcGFkLmlkLm1hdGNoKC8oXFx3KyktKFxcdyspLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSkubWFwKHV0aWxzLnN0cmlwTGVhZGluZ1plcm9zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYml0cy5zbGljZSgwLCAyKS5tYXAodXRpbHMuc3RyaXBMZWFkaW5nWmVyb3MpO1xuICB9XG5cbiAgX2hhc0dhbWVwYWRzKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9nYW1lcGFkQXBpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMuX2dhbWVwYWRBcGlzW2ldIGluIG5hdmlnYXRvcikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2dldEdhbWVwYWRzKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9nYW1lcGFkQXBpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMuX2dhbWVwYWRBcGlzW2ldIGluIG5hdmlnYXRvcikge1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yW3RoaXMuX2dhbWVwYWRBcGlzW2ldXSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICB1cGRhdGVHYW1lcGFkKGdhbWVwYWQpIHtcbiAgICB0aGlzLnByZXZpb3VzU3RhdGVbZ2FtZXBhZC5pbmRleF0gPSB1dGlscy5jbG9uZSh0aGlzLnN0YXRlW2dhbWVwYWQuaW5kZXhdIHx8IERFRkFVTFRfU1RBVEUpO1xuICAgIHRoaXMuc3RhdGVbZ2FtZXBhZC5pbmRleF0gPSBnYW1lcGFkID8gdXRpbHMuY2xvbmUoZ2FtZXBhZCkgOiBERUZBVUxUX1NUQVRFO1xuXG4gICAgLy8gRmlyZSBjb25uZWN0aW9uIGV2ZW50LCBpZiBnYW1lcGFkIHdhcyBhY3R1YWxseSBjb25uZWN0ZWQuXG4gICAgdGhpcy5maXJlQ29ubmVjdGlvbkV2ZW50KHRoaXMuc3RhdGVbZ2FtZXBhZC5pbmRleF0sIHRydWUpO1xuICB9XG5cbiAgcmVtb3ZlR2FtZXBhZChnYW1lcGFkKSB7XG4gICAgZGVsZXRlIHRoaXMuc3RhdGVbZ2FtZXBhZC5pbmRleF07XG5cbiAgICAvLyBGaXJlIGRpc2Nvbm5lY3Rpb24gZXZlbnQuXG4gICAgdGhpcy5maXJlQ29ubmVjdGlvbkV2ZW50KGdhbWVwYWQsIGZhbHNlKTtcbiAgfVxuXG4gIG9ic2VydmVCdXR0b25DaGFuZ2VzKGdhbWVwYWQpIHtcbiAgICB2YXIgcHJldmlvdXNQYWQgPSB0aGlzLnByZXZpb3VzU3RhdGVbZ2FtZXBhZC5pbmRleF07XG4gICAgdmFyIGN1cnJlbnRQYWQgPSB0aGlzLnN0YXRlW2dhbWVwYWQuaW5kZXhdO1xuXG4gICAgaWYgKCFwcmV2aW91c1BhZCB8fCAhT2JqZWN0LmtleXMocHJldmlvdXNQYWQpLmxlbmd0aCB8fFxuICAgICAgICAhY3VycmVudFBhZCB8fCAhT2JqZWN0LmtleXMoY3VycmVudFBhZCkubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3VycmVudFBhZC5idXR0b25zLmZvckVhY2goKGJ1dHRvbiwgYnV0dG9uSWR4KSA9PiB7XG4gICAgICBpZiAoYnV0dG9uLnZhbHVlICE9PSBwcmV2aW91c1BhZC5idXR0b25zW2J1dHRvbklkeF0udmFsdWUpIHtcbiAgICAgICAgLy8gRmlyZSBidXR0b24gZXZlbnRzLlxuICAgICAgICB0aGlzLmZpcmVCdXR0b25FdmVudChjdXJyZW50UGFkLCBidXR0b25JZHgsIGJ1dHRvbi52YWx1ZSk7XG5cbiAgICAgICAgLy8gRmlyZSBzeW50aGV0aWMga2V5Ym9hcmQgZXZlbnRzLCBpZiBuZWVkZWQuXG4gICAgICAgIHRoaXMuZmlyZUtleUV2ZW50KGN1cnJlbnRQYWQsIGJ1dHRvbklkeCwgYnV0dG9uLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9ic2VydmVBeGlzQ2hhbmdlcyhnYW1lcGFkKSB7XG4gICAgdmFyIHByZXZpb3VzUGFkID0gdGhpcy5wcmV2aW91c1N0YXRlW2dhbWVwYWQuaW5kZXhdO1xuICAgIHZhciBjdXJyZW50UGFkID0gdGhpcy5zdGF0ZVtnYW1lcGFkLmluZGV4XTtcblxuICAgIGlmICghcHJldmlvdXNQYWQgfHwgIU9iamVjdC5rZXlzKHByZXZpb3VzUGFkKS5sZW5ndGggfHxcbiAgICAgICAgIWN1cnJlbnRQYWQgfHwgIU9iamVjdC5rZXlzKGN1cnJlbnRQYWQpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN1cnJlbnRQYWQuYXhlcy5mb3JFYWNoKChheGlzLCBheGlzSWR4KSA9PiB7XG4gICAgICAvLyBGaXJlIGF4aXMgZXZlbnRzLlxuICAgICAgaWYgKGF4aXMgIT09IHByZXZpb3VzUGFkLmF4ZXNbYXhpc0lkeF0pIHtcbiAgICAgICAgdGhpcy5maXJlQXhpc01vdmVFdmVudChjdXJyZW50UGFkLCBheGlzSWR4LCBheGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQG5hbWUgR2FtZXBhZHMjdXBkYXRlXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiAgIFVwZGF0ZSB0aGUgY3VycmVudCBhbmQgcHJldmlvdXMgc3RhdGVzIG9mIHRoZSBnYW1lcGFkcy5cbiAgICogICBUaGlzIG11c3QgYmUgY2FsbGVkIGV2ZXJ5IGZyYW1lIGZvciBldmVudHMgdG8gd29yay5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICB2YXIgYWN0aXZlUGFkcyA9IHt9O1xuXG4gICAgdGhpcy5wb2xsKCkuZm9yRWFjaChwYWQgPT4ge1xuICAgICAgLy8gS2VlcCB0cmFjayBvZiB3aGljaCBnYW1lcGFkcyBhcmUgc3RpbGwgYWN0aXZlIChub3QgZGlzY29ubmVjdGVkKS5cbiAgICAgIGFjdGl2ZVBhZHNbcGFkLmluZGV4XSA9IHRydWU7XG5cbiAgICAgIC8vIEFkZC91cGRhdGUgY29ubmVjdGVkIGdhbWVwYWRzXG4gICAgICAvLyAoYW5kIGZpcmUgaW50ZXJuYWwgZXZlbnRzICsgcG9seWZpbGxlZCBldmVudHMsIGlmIG5lZWRlZCkuXG4gICAgICB0aGlzLnVwZGF0ZUdhbWVwYWQocGFkKTtcblxuICAgICAgLy8gTmV2ZXIgc2VlbiB0aGlzIGFjdHVhbGx5IGJlIHRoZSBjYXNlLCBidXQgaWYgYSBwYWQgaXMgc3RpbGwgaW4gdGhlXG4gICAgICAvLyBgbmF2aWdhdG9yLmdldEdhbWVwYWRzKClgIGxpc3QgYW5kIGl0J3MgZGlzY29ubmVjdGVkLCBlbWl0IHRoZSBldmVudC5cbiAgICAgIGlmICghcGFkLmNvbm5lY3RlZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUdhbWVwYWQodGhpcy5zdGF0ZVtwYWRJZHhdKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmlyZSBpbnRlcm5hbCBldmVudHMgKyBwb2x5ZmlsbGVkIG5vbi1zdGFuZGFyZCBldmVudHMsIGlmIG5lZWRlZC5cbiAgICAgIHRoaXMub2JzZXJ2ZUJ1dHRvbkNoYW5nZXMocGFkKTtcbiAgICAgIHRoaXMub2JzZXJ2ZUF4aXNDaGFuZ2VzKHBhZCk7XG4gICAgfSk7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnN0YXRlKS5mb3JFYWNoKHBhZElkeCA9PiB7XG4gICAgICBpZiAoIShwYWRJZHggaW4gYWN0aXZlUGFkcykpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGRpc2Nvbm5lY3RlZCBnYW1lcGFkc1xuICAgICAgICAvLyAoYW5kIGZpcmUgaW50ZXJuYWwgZXZlbnRzICsgcG9seWZpbGxlZCBldmVudHMsIGlmIG5lZWRlZCkuXG4gICAgICAgIHRoaXMucmVtb3ZlR2FtZXBhZCh0aGlzLnN0YXRlW3BhZElkeF0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbmFtZSBHYW1lcGFkcyNnZXRHYW1lcGFkRGF0YVNvdXJjZVxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGdhbWVwYWQgZGF0YSBzb3VyY2UgKGUuZy4sIGxpbnV4am95LCBoaWQsIGRpbnB1dCwgeGlucHV0KS5cbiAgICogQHJldHVybnMge1N0cmluZ30gQSBzdHJpbmcgb2YgZ2FtZXBhZCBkYXRhIHNvdXJjZS5cbiAgICovXG4gIGdldEdhbWVwYWREYXRhU291cmNlKCkge1xuICAgIHZhciBkYXRhU291cmNlO1xuICAgIGlmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goL15MaW51eC8pKSB7XG4gICAgICBkYXRhU291cmNlID0gJ2xpbnV4am95JztcbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaCgvXk1hYy8pKSB7XG4gICAgICBkYXRhU291cmNlID0gJ2hpZCc7XG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goL15XaW4vKSkge1xuICAgICAgdmFyIG0gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKCdHZWNrby8oLi4pJyk7XG4gICAgICBpZiAobSAmJiBwYXJzZUludChtWzFdKSA8IDMyKSB7XG4gICAgICAgIGRhdGFTb3VyY2UgPSAnZGlucHV0JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFTb3VyY2UgPSAnaGlkJztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGFTb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBuYW1lIEdhbWVwYWRzI3BvbGxcbiAgICogQGRlc2NyaXB0aW9uIFBvbGwgZm9yIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZSBnYW1lcGFkIEFQSS5cbiAgICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBnYW1lcGFkcyBhbmQgbWFwcGluZ3MgZm9yIHRoZSBtb2RlbCBvZiB0aGUgY29ubmVjdGVkIGdhbWVwYWQuXG4gICAqIEBleGFtcGxlXG4gICAqICAgdmFyIGdhbWVwYWRzID0gbmV3IEdhbWVwYWRzKCk7XG4gICAqICAgdmFyIHBhZHMgPSBnYW1lcGFkcy5wb2xsKCk7XG4gICAqL1xuICBwb2xsKCkge1xuICAgIHZhciBwYWRzID0gW107XG5cbiAgICBpZiAodGhpcy5nYW1lcGFkc1N1cHBvcnRlZCkge1xuICAgICAgdmFyIHBhZHNSYXcgPSB0aGlzLl9nZXRHYW1lcGFkcygpO1xuICAgICAgdmFyIHBhZDtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhZHNSYXcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcGFkID0gcGFkc1Jhd1tpXTtcblxuICAgICAgICBpZiAoIXBhZCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFkID0gdGhpcy5leHRlbmQocGFkKTtcblxuICAgICAgICBwYWRzLnB1c2gocGFkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGFkcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQG5hbWUgR2FtZXBhZHMjZXh0ZW5kXG4gICAqIEBkZXNjcmlwdGlvbiBTZXQgbmV3IHByb3BlcnRpZXMgb24gYSBnYW1lcGFkIG9iamVjdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWVwYWQgVGhlIG9yaWdpbmFsIGdhbWVwYWQgb2JqZWN0LlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBleHRlbmRlZCBjb3B5IG9mIHRoZSBnYW1lcGFkLlxuICAgKi9cbiAgZXh0ZW5kKGdhbWVwYWQpIHtcbiAgICBpZiAoZ2FtZXBhZC5fZXh0ZW5kZWQpIHtcbiAgICAgIHJldHVybiBnYW1lcGFkO1xuICAgIH1cblxuICAgIHZhciBwYWQgPSB1dGlscy5jbG9uZShnYW1lcGFkKTtcblxuICAgIHBhZC5fZXh0ZW5kZWQgPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMuZ2FtZXBhZEF0dHJpYnV0ZXNFbmFibGVkKSB7XG4gICAgICBwYWQuYXR0cmlidXRlcyA9IHRoaXMuX2dldEF0dHJpYnV0ZXMocGFkKTtcbiAgICB9XG5cbiAgICBpZiAoIXBhZC50aW1lc3RhbXApIHtcbiAgICAgIHBhZC50aW1lc3RhbXAgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2FtZXBhZEluZGljZXNFbmFibGVkKSB7XG4gICAgICBwYWQuaW5kaWNlcyA9IHRoaXMuX2dldEluZGljZXMocGFkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFkO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbmFtZSBHYW1lcGFkcyNfZ2V0QXR0cmlidXRlc1xuICAgKiBAZGVzY3JpcHRpb24gR2VuZXJhdGUgYW5kIHJldHVybiB0aGUgYXR0cmlidXRlcyBvZiBhIGdhbWVwYWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBnYW1lcGFkIFRoZSBnYW1lcGFkIG9iamVjdC5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGF0dHJpYnV0ZXMgZm9yIHRoaXMgZ2FtZXBhZC5cbiAgICovXG4gIF9nZXRBdHRyaWJ1dGVzKGdhbWVwYWQpIHtcbiAgICB2YXIgcGFkSWRzID0gdGhpcy5fZ2V0VmVuZG9yUHJvZHVjdElkcyhnYW1lcGFkKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmVuZG9ySWQ6IHBhZElkc1swXSxcbiAgICAgIHByb2R1Y3RJZDogcGFkSWRzWzFdLFxuICAgICAgbmFtZTogZ2FtZXBhZC5pZCxcbiAgICAgIGRhdGFTb3VyY2U6IHRoaXMuZGF0YVNvdXJjZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBuYW1lIEdhbWVwYWRzI19nZXRJbmRpY2VzXG4gICAqIEBkZXNjcmlwdGlvbiBSZXR1cm4gdGhlIG5hbWVkIGluZGljZXMgb2YgYSBnYW1lcGFkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZ2FtZXBhZCBUaGUgZ2FtZXBhZCBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBuYW1lZCBpbmRpY2VzIGZvciB0aGlzIGdhbWVwYWQuXG4gICAqL1xuICBfZ2V0SW5kaWNlcyhnYW1lcGFkKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kaWNlc1tnYW1lcGFkLmlkXSB8fCB0aGlzLmluZGljZXMuc3RhbmRhcmQgfHwge307XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBuYW1lIEdhbWVwYWRzI19tYXBBeGlzXG4gICAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIHZhbHVlIGZvciBvbmUgb2YgdGhlIGFuYWxvZ3VlIGF4ZXMgb2YgdGhlIHBhZC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGF4aXMgVGhlIGJ1dHRvbiB0byBnZXQgdGhlIHZhbHVlIG9mLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgdmFsdWUgb2YgdGhlIGF4aXMgYmV0d2VlbiAtMSBhbmQgMS5cbiAgICovXG4gIF9tYXBBeGlzKGF4aXMpIHtcbiAgICBpZiAoTWF0aC5hYnMoYXhpcykgPCB0aGlzLmF4aXNUaHJlc2hvbGQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybiBheGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbmFtZSBHYW1lcGFkcyNfbWFwQnV0dG9uXG4gICAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIHZhbHVlIGZvciBvbmUgb2YgdGhlIGJ1dHRvbnMgb2YgdGhlIHBhZC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGJ1dHRvbiBUaGUgYnV0dG9uIHRvIGdldCB0aGUgdmFsdWUgb2YuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEFuIG9iamVjdCByZXNlbWJsaW5nIGEgYEdhbWVwYWRCdXR0b25gIG9iamVjdC5cbiAgICovXG4gIF9tYXBCdXR0b24oYnV0dG9uKSB7XG4gICAgaWYgKHR5cGVvZiBidXR0b24gPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBPbGQgdmVyc2lvbnMgb2YgdGhlIEFQSSB1c2VkIHRvIHJldHVybiBqdXN0IG51bWJlcnMgaW5zdGVhZFxuICAgICAgLy8gb2YgYEdhbWVwYWRCdXR0b25gIG9iamVjdHMuXG4gICAgICBidXR0b24gPSBuZXcgR2FtZXBhZEJ1dHRvbih7XG4gICAgICAgIHByZXNzZWQ6IGJ1dHRvbiA9PT0gMSxcbiAgICAgICAgdmFsdWU6IGJ1dHRvblxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1dHRvbjtcbiAgfVxuXG4gIHNldEluZGljZXMoaW5kaWNlcykge1xuICAgIHRoaXMuaW5kaWNlcyA9IHV0aWxzLmNsb25lKGluZGljZXMpO1xuICB9XG5cbiAgZmlyZUNvbm5lY3Rpb25FdmVudChnYW1lcGFkLCBjb25uZWN0ZWQpIHtcbiAgICB2YXIgbmFtZSA9IGNvbm5lY3RlZCA/ICdnYW1lcGFkY29ubmVjdGVkJyA6ICdnYW1lcGFkZGlzY29ubmVjdGVkJztcblxuICAgIGlmICghdGhpcy5oYXNTZWVuRXZlbnQoZ2FtZXBhZCwgbmFtZSwgJ2ludGVybmFsJykpIHtcbiAgICAgIC8vIEZpcmUgaW50ZXJuYWwgZXZlbnQuXG4gICAgICB0aGlzLmVtaXQobmFtZSwgZ2FtZXBhZCk7XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgZmlyZSB0aGUgJ2dhbWVwYWRjb25uZWN0ZWQnLydnYW1lcGFkZGlzY29ubmVjdGVkJyBldmVudHMgaWYgdGhlXG4gICAgLy8gYnJvd3NlciBoYXMgYWxyZWFkeSBmaXJlZCB0aGVtLiAoVW5mb3J0dW5hdGVseSwgd2UgY2FuJ3QgZmVhdHVyZSBkZXRlY3RcbiAgICAvLyBpZiB0aGV5J2xsIGdldCBmaXJlZC4pXG4gICAgaWYgKCF0aGlzLmhhc1NlZW5FdmVudChnYW1lcGFkLCBuYW1lLCAnZG9tJykpIHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIGdhbWVwYWQ6IGdhbWVwYWRcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdXRpbHMudHJpZ2dlckV2ZW50KHdpbmRvdywgbmFtZSwgZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgZmlyZUJ1dHRvbkV2ZW50KGdhbWVwYWQsIGJ1dHRvbiwgdmFsdWUpIHtcbiAgICB2YXIgbmFtZSA9IHZhbHVlID09PSAxID8gJ2dhbWVwYWRidXR0b25kb3duJyA6ICdnYW1lcGFkYnV0dG9udXAnO1xuXG4gICAgLy8gRmlyZSBpbnRlcm5hbCBldmVudC5cbiAgICB0aGlzLmVtaXQobmFtZSwgZ2FtZXBhZCwgYnV0dG9uLCB2YWx1ZSk7XG5cbiAgICBpZiAodGhpcy5ub25zdGFuZGFyZEV2ZW50c0VuYWJsZWQgJiYgISgnR2FtZXBhZEJ1dHRvbkV2ZW50JyBpbiB3aW5kb3cpKSB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBidXR0b246IGJ1dHRvbixcbiAgICAgICAgICBnYW1lcGFkOiBnYW1lcGFkXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB1dGlscy50cmlnZ2VyRXZlbnQod2luZG93LCBuYW1lLCBkYXRhKTtcbiAgICB9XG4gIH1cblxuICBmaXJlQXhpc01vdmVFdmVudChnYW1lcGFkLCBheGlzLCB2YWx1ZSkge1xuICAgIHZhciBuYW1lID0gJ2dhbWVwYWRheGlzbW92ZSc7XG5cbiAgICAvLyBGaXJlIGludGVybmFsIGV2ZW50LlxuICAgIHRoaXMuZW1pdChuYW1lLCBnYW1lcGFkLCBheGlzLCB2YWx1ZSk7XG5cbiAgICBpZiAoIXRoaXMubm9uc3RhbmRhcmRFdmVudHNFbmFibGVkIHx8ICdHYW1lcGFkQXhpc01vdmVFdmVudCcgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKE1hdGguYWJzKHZhbHVlKSA8IHRoaXMuYXhpc1RocmVzaG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkYXRhID0ge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDoge1xuICAgICAgICBheGlzOiBheGlzLFxuICAgICAgICBnYW1lcGFkOiBnYW1lcGFkLFxuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIH1cbiAgICB9O1xuICAgIHV0aWxzLnRyaWdnZXJFdmVudCh3aW5kb3csIG5hbWUsIGRhdGEpO1xuICB9XG5cbiAgZmlyZUtleUV2ZW50KGdhbWVwYWQsIGJ1dHRvbiwgdmFsdWUpIHtcbiAgICBpZiAoIXRoaXMua2V5RXZlbnRzRW5hYmxlZCB8fCAhdGhpcy5rZXlFdmVudHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYnV0dG9uTmFtZSA9IHV0aWxzLnN3YXAoZ2FtZXBhZC5pbmRpY2VzKVtidXR0b25dO1xuXG4gICAgaWYgKHR5cGVvZiBidXR0b25OYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuYW1lcyA9IHZhbHVlID09PSAxID8gWydrZXlkb3duJywgJ2tleXByZXNzJ10gOiBbJ2tleXVwJ107XG4gICAgdmFyIGRhdGEgPSB0aGlzLmtleUV2ZW50c1tidXR0b25OYW1lXTtcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKCdidWJibGVzJyBpbiBkYXRhKSkge1xuICAgICAgZGF0YS5idWJibGVzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCFkYXRhLmRldGFpbCkge1xuICAgICAgZGF0YS5kZXRhaWwgPSB7fTtcbiAgICB9XG4gICAgZGF0YS5kZXRhaWwuYnV0dG9uID0gYnV0dG9uO1xuICAgIGRhdGEuZGV0YWlsLmdhbWVwYWQgPSBnYW1lcGFkO1xuXG4gICAgbmFtZXMuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIHV0aWxzLnRyaWdnZXJFdmVudChkYXRhLnRhcmdldCB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50LCBuYW1lLCBkYXRhKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFNlZW5FdmVudChnYW1lcGFkLCBldmVudFR5cGUsIG5hbWVzcGFjZSkge1xuICAgIHZhciBrZXkgPSBbZ2FtZXBhZC5pbmRleCwgZXZlbnRUeXBlLCBuYW1lc3BhY2VdLmpvaW4oJy4nKTtcblxuICAgIHRoaXMuX3NlZW5FdmVudHNba2V5XSA9IHRydWU7XG4gIH1cblxuICBoYXNTZWVuRXZlbnQoZ2FtZXBhZCwgZXZlbnRUeXBlLCBuYW1lc3BhY2UpIHtcbiAgICB2YXIga2V5ID0gW2dhbWVwYWQuaW5kZXgsIGV2ZW50VHlwZSwgbmFtZXNwYWNlXS5qb2luKCcuJyk7XG5cbiAgICByZXR1cm4gISF0aGlzLl9zZWVuRXZlbnRzW2tleV07XG4gIH1cblxuICByZW1vdmVTZWVuRXZlbnQoZ2FtZXBhZCwgZXZlbnRUeXBlLCBuYW1lc3BhY2UpIHtcbiAgICB2YXIga2V5ID0gW2dhbWVwYWQuaW5kZXgsIGV2ZW50VHlwZSwgbmFtZXNwYWNlXS5qb2luKCcuJyk7XG5cbiAgICBkZWxldGUgdGhpcy5fc2VlbkV2ZW50c1trZXldO1xuICB9XG5cbiAgYnV0dG9uRXZlbnQyYXhpc0V2ZW50KGUpIHtcbiAgICBpZiAoZS50eXBlID09PSAnZ2FtZXBhZGJ1dHRvbmRvd24nKSB7XG4gICAgICBlLmF4aXMgPSBlLmJ1dHRvbjtcbiAgICAgIGUudmFsdWUgPSAxLjA7XG4gICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdnYW1lcGFkYnV0dG9udXAnKSB7XG4gICAgICBlLmF4aXMgPSBlLmJ1dHRvbjtcbiAgICAgIGUudmFsdWUgPSAwLjA7XG4gICAgfVxuICAgIHJldHVybiBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhIGBidXR0b25gIGluZGV4IGVxdWFscyB0aGUgc3VwcGxpZWQgYGtleWAuXG4gICAqXG4gICAqIFVzZWZ1bCBmb3IgZGV0ZXJtaW5pbmcgd2hldGhlciBgYG5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdLmJ1dHRvbnNbYCRidXR0b25gXWBgXG4gICAqIGhhcyBhbnkgYmluZGluZ3MgZGVmaW5lZCAoaW4gYEZyYW1lTWFuYWdlcmApLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gYnV0dG9uIEluZGV4IG9mIGdhbWVwYWQgYnV0dG9uIChlLmcuLCBgNGApLlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBmb3IgYnV0dG9uIGJpbmRpbmcgKGUuZy4sICdiNCcpLlxuICAgKi9cbiAgX2J1dHRvbkRvd25FcXVhbHNLZXkoYnV0dG9uLCBrZXkpIHtcbiAgICByZXR1cm4gJ2InICsgYnV0dG9uICsgJy5kb3duJyA9PT0ga2V5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgX2J1dHRvblVwRXF1YWxzS2V5KGJ1dHRvbiwga2V5KSB7XG4gICAgdmFyIGtleUNsZWFuID0ga2V5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiAoXG4gICAgICAnYicgKyBidXR0b24gKyAnLnVwJyA9PT0ga2V5Q2xlYW4gfHxcbiAgICAgICdiJyArIGJ1dHRvbiA9PT0ga2V5Q2xlYW5cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhbiBgYXhpc2AgaW5kZXggZXF1YWxzIHRoZSBzdXBwbGllZCBga2V5YC5cbiAgICpcbiAgICogVXNlZnVsIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIGBgbmF2aWdhdG9yLmdldEdhbWVwYWRzKClbMF0uYXhlc1tgJGJ1dHRvbmBdYGBcbiAgICogaGFzIGFueSBiaW5kaW5ncyBkZWZpbmVkIChpbiBgRnJhbWVNYW5hZ2VyYCkuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBidXR0b24gSW5kZXggb2YgZ2FtZXBhZCBheGlzIChlLmcuLCBgMWApLlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IEh1bWFuLXJlYWRhYmxlIGZvcm1hdCBmb3IgYnV0dG9uIGJpbmRpbmcgKGUuZy4sICdhMScpLlxuICAgKi9cbiAgX2F4aXNNb3ZlRXF1YWxzS2V5KGF4aXMsIGtleSkge1xuICAgIHJldHVybiAnYScgKyBheGlzID09PSBrZXkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYW55IGJpbmRpbmdzIGRlZmluZWQgZm9yICdjb25uZWN0ZWQnIChpbiBgRnJhbWVNYW5hZ2VyYCkuXG4gICAqXG4gICAqIChDYWxsZWQgYnkgZXZlbnQgbGlzdGVuZXIgZm9yIGBnYW1lcGFkY29ubmVjdGVkYC4pXG4gICAqXG4gICAqIEBwYXJhbSB7R2FtZXBhZH0gZ2FtZXBhZCBHYW1lcGFkIG9iamVjdCAoYWZ0ZXIgaXQncyBiZWVuIHdyYXBwZWQgYnkgZ2FtZXBhZC1wbHVzKS5cbiAgICovXG4gIF9vbkdhbWVwYWRDb25uZWN0ZWQoZ2FtZXBhZCkge1xuICAgIGlmICgnY29ubmVjdGVkJyBpbiBnYW1lcGFkLmluZGljZXMpIHtcbiAgICAgIGdhbWVwYWQuaW5kaWNlcy5jb25uZWN0ZWQoZ2FtZXBhZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGFueSBiaW5kaW5ncyBkZWZpbmVkIGZvciAnZGlzY29ubmVjdGVkJyAoaW4gYEZyYW1lTWFuYWdlcmApLlxuICAgKlxuICAgKiAoQ2FsbGVkIGJ5IGV2ZW50IGxpc3RlbmVyIGZvciBgZ2FtZXBhZGNvbm5lY3RlZGAuKVxuICAgKlxuICAgKiBAcGFyYW0ge0dhbWVwYWR9IGdhbWVwYWQgR2FtZXBhZCBvYmplY3QgKGFmdGVyIGl0J3MgYmVlbiB3cmFwcGVkIGJ5IGdhbWVwYWQtcGx1cykuXG4gICAqL1xuICBfb25HYW1lcGFkRGlzY29ubmVjdGVkKGdhbWVwYWQpIHtcbiAgICBpZiAoJ2Rpc2Nvbm5lY3RlZCcgaW4gZ2FtZXBhZC5pbmRpY2VzKSB7XG4gICAgICBnYW1lcGFkLmluZGljZXMuZGlzY29ubmVjdGVkKGdhbWVwYWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhbnkgYmluZGluZ3MgZGVmaW5lZCBmb3IgYnV0dG9ucyAoZS5nLiwgJ2I0LnVwJyBpbiBgRnJhbWVNYW5hZ2VyYCkuXG4gICAqXG4gICAqIChDYWxsZWQgYnkgZXZlbnQgbGlzdGVuZXIgZm9yIGBnYW1lcGFkY29ubmVjdGVkYC4pXG4gICAqXG4gICAqIEBwYXJhbSB7R2FtZXBhZH0gZ2FtZXBhZCBHYW1lcGFkIG9iamVjdCAoYWZ0ZXIgaXQncyBiZWVuIHdyYXBwZWQgYnkgZ2FtZXBhZC1wbHVzKS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGJ1dHRvbiBJbmRleCBvZiBnYW1lcGFkIGJ1dHRvbiAoaW50ZWdlcikgYmVpbmcgcHJlc3NlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIChwZXIgYGdhbWVwYWRidXR0b25kb3duYCBldmVudCkuXG4gICAqL1xuICBfb25HYW1lcGFkQnV0dG9uRG93bihnYW1lcGFkLCBidXR0b24pIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZ2FtZXBhZC5pbmRpY2VzKSB7XG4gICAgICBpZiAodGhpcy5fYnV0dG9uRG93bkVxdWFsc0tleShidXR0b24sIGtleSkpIHtcbiAgICAgICAgZ2FtZXBhZC5pbmRpY2VzW2tleV0oZ2FtZXBhZCwgYnV0dG9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYW55IGJpbmRpbmdzIGRlZmluZWQgZm9yIGJ1dHRvbnMgKGUuZy4sICdiNC5kb3duJyBpbiBgRnJhbWVNYW5hZ2VyYCkuXG4gICAqXG4gICAqIChDYWxsZWQgYnkgZXZlbnQgbGlzdGVuZXIgZm9yIGBnYW1lcGFkY29ubmVjdGVkYC4pXG4gICAqXG4gICAqIEBwYXJhbSB7R2FtZXBhZH0gZ2FtZXBhZCBHYW1lcGFkIG9iamVjdCAoYWZ0ZXIgaXQncyBiZWVuIHdyYXBwZWQgYnkgZ2FtZXBhZC1wbHVzKS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGJ1dHRvbiBJbmRleCBvZiBnYW1lcGFkIGJ1dHRvbiAoaW50ZWdlcikgYmVpbmcgcmVsZWFzZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAocGVyIGBnYW1lcGFkYnV0dG9udXBgIGV2ZW50KS5cbiAgICovXG4gIF9vbkdhbWVwYWRCdXR0b25VcChnYW1lcGFkLCBidXR0b24pIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZ2FtZXBhZC5pbmRpY2VzKSB7XG4gICAgICBpZiAodGhpcy5fYnV0dG9uVXBFcXVhbHNLZXkoYnV0dG9uLCBrZXkpKSB7XG4gICAgICAgIGdhbWVwYWQuaW5kaWNlc1trZXldKGdhbWVwYWQsIGJ1dHRvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGFueSBiaW5kaW5ncyBkZWZpbmVkIGZvciBheGVzIChlLmcuLCAnYTEnIGluIGBGcmFtZU1hbmFnZXJgKS5cbiAgICpcbiAgICogKENhbGxlZCBieSBldmVudCBsaXN0ZW5lciBmb3IgYGdhbWVwYWRheGlzbW92ZWAuKVxuICAgKlxuICAgKiBAcGFyYW0ge0dhbWVwYWR9IGdhbWVwYWQgR2FtZXBhZCBvYmplY3QgKGFmdGVyIGl0J3MgYmVlbiB3cmFwcGVkIGJ5IGdhbWVwYWQtcGx1cykuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBheGlzIEluZGV4IG9mIGdhbWVwYWQgYXhpcyAoaW50ZWdlcikgYmVpbmcgY2hhbmdlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAocGVyIGBnYW1lcGFkYXhpc21vdmVgIGV2ZW50KS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIFZhbHVlIG9mIGdhbWVwYWQgYXhpcyAoZnJvbSAtMS4wIHRvIDEuMCkgYmVpbmdcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgKHBlciBgZ2FtZXBhZGF4aXNtb3ZlYCBldmVudCkuXG4gICAqL1xuICBfb25HYW1lcGFkQXhpc01vdmUoZ2FtZXBhZCwgYXhpcywgdmFsdWUpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZ2FtZXBhZC5pbmRpY2VzKSB7XG4gICAgICBpZiAodGhpcy5fYXhpc01vdmVFcXVhbHNLZXkoYXhpcywga2V5KSkge1xuICAgICAgICBnYW1lcGFkLmluZGljZXNba2V5XShnYW1lcGFkLCBheGlzLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuR2FtZXBhZHMudXRpbHMgPSB1dGlscztcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWxzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5icm93c2VyID0gdGhpcy5nZXRCcm93c2VyKCk7XG4gICAgdGhpcy5lbmdpbmUgPSB0aGlzLmdldEVuZ2luZSh0aGlzLmJyb3dzZXIpO1xuICB9XG5cbiAgY2xvbmUob2JqKSB7XG4gICAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nIHx8ICEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICB2YXIgcmV0ID0gJyc7XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgcmV0ID0gbmV3IERhdGUoKTtcbiAgICAgIHJldC5zZXRUaW1lKG9iai5nZXRUaW1lKCkpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHJldCA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICByZXRbaV0gPSB0aGlzLmNsb25lKG9ialtpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgIHJldCA9IHt9O1xuICAgICAgZm9yICh2YXIgYXR0ciBpbiBvYmopIHtcbiAgICAgICAgaWYgKGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgcmV0W2F0dHJdID0gdGhpcy5jbG9uZShvYmpbYXR0cl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNsb25lIG9iamVjdCBvZiB1bmV4cGVjdGVkIHR5cGUhJyk7XG4gIH1cblxuICBzd2FwKG9iaikge1xuICAgIHZhciByZXQgPSB7fTtcbiAgICBmb3IgKHZhciBhdHRyIGluIG9iaikge1xuICAgICAgaWYgKGF0dHIgaW4gb2JqKSB7XG4gICAgICAgIHJldFtvYmpbYXR0cl1dID0gYXR0cjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldEJyb3dzZXIoKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIE9QUi8nKSA+PSAwKSB7XG4gICAgICAvLyBPcGVyYSA4LjArIChVQSBkZXRlY3Rpb24gdG8gZGV0ZWN0IEJsaW5rL3Y4LXBvd2VyZWQgT3BlcmEpLlxuICAgICAgcmV0dXJuICdvcGVyYSc7XG4gICAgfSBlbHNlIGlmICgnY2hyb21lJyBpbiB3aW5kb3cpIHtcbiAgICAgIC8vIENocm9tZSAxKy5cbiAgICAgIHJldHVybiAnY2hyb21lJztcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIEZpcmVmb3ggMS4wKy5cbiAgICAgIHJldHVybiAnZmlyZWZveCc7XG4gICAgfSBlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwod2luZG93LkhUTUxFbGVtZW50KS5pbmRleE9mKCdDb25zdHJ1Y3RvcicpID4gMCkge1xuICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIDMrOiBcIltvYmplY3QgSFRNTEVsZW1lbnRDb25zdHJ1Y3Rvcl1cIi5cbiAgICAgIHJldHVybiAnc2FmYXJpJztcbiAgICB9IGVsc2UgaWYgKC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlKSB7XG4gICAgICAvLyBBdCBsZWFzdCBJRTYuXG4gICAgICByZXR1cm4gJ2llJztcbiAgICB9XG4gIH1cblxuICBnZXRFbmdpbmUoYnJvd3Nlcikge1xuICAgIGJyb3dzZXIgPSBicm93c2VyIHx8IHRoaXMuZ2V0QnJvd3NlcigpO1xuXG4gICAgaWYgKGJyb3dzZXIgPT09ICdmaXJlZm94Jykge1xuICAgICAgcmV0dXJuICdnZWNrbyc7XG4gICAgfSBlbHNlIGlmIChicm93c2VyID09PSAnb3BlcmEnIHx8IGJyb3dzZXIgPT09ICdjaHJvbWUnIHx8IGJyb3dzZXIgPT09ICdzYWZhcmknKSB7XG4gICAgICByZXR1cm4gJ3dlYmtpdCc7XG4gICAgfSBlbHNlIGlmIChicm93c2VyID09PSAnaWUnKSB7XG4gICAgICByZXR1cm4gJ3RyaWRlbnQnO1xuICAgIH1cbiAgfVxuXG4gIHN0cmlwTGVhZGluZ1plcm9zKHN0cikge1xuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eMCsoPz1cXGQrKS9nLCAnJyk7XG4gIH1cblxuICB0cmlnZ2VyRXZlbnQoZWwsIG5hbWUsIGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YSB8fCB7fTtcbiAgICBkYXRhLmRldGFpbCA9IGRhdGEuZGV0YWlsIHx8IHt9O1xuXG4gICAgdmFyIGV2ZW50O1xuXG4gICAgaWYgKCdDdXN0b21FdmVudCcgaW4gd2luZG93KSB7XG4gICAgICBldmVudCA9IG5ldyBDdXN0b21FdmVudChuYW1lLCBkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChuYW1lLCBkYXRhLmJ1YmJsZXMsIGRhdGEuY2FuY2VsYWJsZSwgZGF0YS5kZXRhaWwpO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGRhdGEuZGV0YWlsKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGV2ZW50W2tleV0gPSBkYXRhLmRldGFpbFtrZXldO1xuICAgIH0pO1xuXG4gICAgZWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cbn1cbiJdfQ==
