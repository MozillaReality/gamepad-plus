import EventEmitter from './event_emitter.js';
import Utils from './utils.js';


var utils = new Utils();

const DEFAULT_CONFIG = {
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


export default class Gamepads extends EventEmitter {
  constructor(config) {
    super();

    this.polyfill();

    //this._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
    this._gamepadDOMEvents = ['gamepadconnected', 'gamepaddisconnected'];
    this._gamepadInternalEvents = ['gamepadconnected', 'gamepaddisconnected',
      'gamepadbuttondown', 'gamepadbuttonup', 'gamepadaxismove'];
    this._seenEvents = {};

    this.dataSource = this.getGamepadDataSource();
    this.gamepadsSupported = this._hasGamepads();
    this.indices = {};
    this.keyEvents = {};
    this.previousState = {};
    this.state = {};

    // Mark the events we see (keyed off gamepad index)
    // so we don't fire the same event twice.
    this._gamepadDOMEvents.forEach(eventName => {
      window.addEventListener(eventName, e => {
        this.addSeenEvent(e.gamepad, eventName, 'dom');

        // Let the events fire again, if they've been disconnected/reconnected.
        if (eventName === 'gamepaddisconnected') {
          this.removeSeenEvent(e.gamepad, 'gamepadconnected', 'dom');
        } else if (eventName === 'gamepadconnected') {
          this.removeSeenEvent(e.gamepad, 'gamepaddisconnected', 'dom');
        }
      });
    });
    this._gamepadInternalEvents.forEach(eventName => {
      this.on(eventName, gamepad => {
        this.addSeenEvent(gamepad, eventName, 'internal');

        if (eventName === 'gamepaddisconnected') {
          this.removeSeenEvent(gamepad, 'gamepadconnected', 'internal');
        } else {
          this.removeSeenEvent(gamepad, 'gamepaddisconnected', 'internal');
        }
      });
    });

    config = config || {};
    Object.keys(DEFAULT_CONFIG).forEach(key => {
      this[key] = typeof config[key] === 'undefined' ? DEFAULT_CONFIG[key] : utils.clone(config[key]);
    });

    if (this.gamepadIndicesEnabled) {
      this.on('gamepadconnected', this._onGamepadConnected.bind(this));
      this.on('gamepaddisconnected', this._onGamepadDisconnected.bind(this));
      this.on('gamepadbuttondown', this._onGamepadButtonDown.bind(this));
      this.on('gamepadbuttonup', this._onGamepadButtonUp.bind(this));
      this.on('gamepadaxismove', this._onGamepadAxisMove.bind(this));
    }
  }

  /**
   * Make gamepads API support check static
   * @returns {string[]}
   */
  static get gamepadApis() {
    return ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
  }


  polyfill() {
    if (this._polyfilled) {
      return;
    }

    if (!('performance' in window)) {
      window.performance = {};
    }

    if (!('now' in window.performance)) {
      window.performance.now = () => {
        return +new Date();
      };
    }

    if (!('GamepadButton' in window)) {
      var GamepadButton = window.GamepadButton = (obj) => {
        return {
          pressed: obj.pressed,
          value: obj.value
        };
      };
    }

    this._polyfilled = true;
  }

  _getVendorProductIds(gamepad) {
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

  /**
   * Make gamepads API support static
   * @returns {boolean}
   */
  static hasGamepads() {
    for (var i = 0, len = Gamepads.gamepadApis.length; i < len; i++) {
      if (Gamepads.gamepadApis[i] in navigator) {
        return true;
      }
    }
    return false;
  }

  /**
   * Make gamepads API support static
   * @returns {*}
   */
  static getGamepads() {
    for (var i = 0, len = Gamepads.gamepadApis.length; i < len; i++) {
      if (Gamepads.gamepadApis[i] in navigator) {
        return navigator[Gamepads.gamepadApis[i]]();
      }
    }
    return [];
  }

  _hasGamepads() {
    return Gamepads.hasGamepads();
  }

  _getGamepads() {
     return Gamepads.getGamepads();
  }

  updateGamepad(gamepad) {
    this.previousState[gamepad.index] = utils.clone(this.state[gamepad.index] || DEFAULT_STATE);
    this.state[gamepad.index] = gamepad ? utils.clone(gamepad) : DEFAULT_STATE;

    // Fire connection event, if gamepad was actually connected.
    this.fireConnectionEvent(this.state[gamepad.index], true);
  }

  removeGamepad(gamepad) {
    delete this.state[gamepad.index];

    // Fire disconnection event.
    this.fireConnectionEvent(gamepad, false);
  }

  observeButtonChanges(gamepad) {
    var previousPad = this.previousState[gamepad.index];
    var currentPad = this.state[gamepad.index];

    if (!previousPad || !Object.keys(previousPad).length ||
        !currentPad || !Object.keys(currentPad).length) {
      return;
    }

    currentPad.buttons.forEach((button, buttonIdx) => {
      if (button.value !== previousPad.buttons[buttonIdx].value) {
        // Fire button events.
        this.fireButtonEvent(currentPad, buttonIdx, button.value);

        // Fire synthetic keyboard events, if needed.
        this.fireKeyEvent(currentPad, buttonIdx, button.value);
      }
    });
  }

  observeAxisChanges(gamepad) {
    var previousPad = this.previousState[gamepad.index];
    var currentPad = this.state[gamepad.index];

    if (!previousPad || !Object.keys(previousPad).length ||
        !currentPad || !Object.keys(currentPad).length) {
      return;
    }

    currentPad.axes.forEach((axis, axisIdx) => {
      // Fire axis events.
      if (axis !== previousPad.axes[axisIdx]) {
        this.fireAxisMoveEvent(currentPad, axisIdx, axis);
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
  update() {
    var activePads = {};

    this.poll().forEach(pad => {
      // Keep track of which gamepads are still active (not disconnected).
      activePads[pad.index] = true;

      // Add/update connected gamepads
      // (and fire internal events + polyfilled events, if needed).
      this.updateGamepad(pad);

      // Never seen this actually be the case, but if a pad is still in the
      // `navigator.getGamepads()` list and it's disconnected, emit the event.
      if (!pad.connected) {
        this.removeGamepad(this.state[padIdx]);
      }

      // Fire internal events + polyfilled non-standard events, if needed.
      this.observeButtonChanges(pad);
      this.observeAxisChanges(pad);
    });

    Object.keys(this.state).forEach(padIdx => {
      if (!(padIdx in activePads)) {
        // Remove disconnected gamepads
        // (and fire internal events + polyfilled events, if needed).
        this.removeGamepad(this.state[padIdx]);
      }
    });
  }

  /**
   * @function
   * @name Gamepads#getGamepadDataSource
   * @description Get gamepad data source (e.g., linuxjoy, hid, dinput, xinput).
   * @returns {String} A string of gamepad data source.
   */
  getGamepadDataSource() {
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
  poll() {
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
  extend(gamepad) {
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
  _getAttributes(gamepad) {
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
  _getIndices(gamepad) {
    return this.indices[gamepad.id] || this.indices.standard || {};
  }

  /**
   * @function
   * @name Gamepads#_mapAxis
   * @description Set the value for one of the analogue axes of the pad.
   * @param {Number} axis The button to get the value of.
   * @returns {Number} The value of the axis between -1 and 1.
   */
  _mapAxis(axis) {
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
  _mapButton(button) {
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

  setIndices(indices) {
    this.indices = utils.clone(indices);
  }

  fireConnectionEvent(gamepad, connected) {
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

  fireButtonEvent(gamepad, button, value) {
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

  fireAxisMoveEvent(gamepad, axis, value) {
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

  fireKeyEvent(gamepad, button, value) {
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

    names.forEach(name => {
      utils.triggerEvent(data.target || document.activeElement, name, data);
    });
  }

  addSeenEvent(gamepad, eventType, namespace) {
    var key = [gamepad.index, eventType, namespace].join('.');

    this._seenEvents[key] = true;
  }

  hasSeenEvent(gamepad, eventType, namespace) {
    var key = [gamepad.index, eventType, namespace].join('.');

    return !!this._seenEvents[key];
  }

  removeSeenEvent(gamepad, eventType, namespace) {
    var key = [gamepad.index, eventType, namespace].join('.');

    delete this._seenEvents[key];
  }

  buttonEvent2axisEvent(e) {
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
  _buttonDownEqualsKey(button, key) {
    return 'b' + button + '.down' === key.trim().toLowerCase();
  }

  _buttonUpEqualsKey(button, key) {
    var keyClean = key.trim().toLowerCase();
    return (
      'b' + button + '.up' === keyClean ||
      'b' + button === keyClean
    );
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
  _axisMoveEqualsKey(axis, key) {
    return 'a' + axis === key.trim().toLowerCase();
  }

  /**
   * Calls any bindings defined for 'connected' (in `FrameManager`).
   *
   * (Called by event listener for `gamepadconnected`.)
   *
   * @param {Gamepad} gamepad Gamepad object (after it's been wrapped by gamepad-plus).
   */
  _onGamepadConnected(gamepad) {
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
  _onGamepadDisconnected(gamepad) {
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
  _onGamepadButtonDown(gamepad, button) {
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
  _onGamepadButtonUp(gamepad, button) {
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
  _onGamepadAxisMove(gamepad, axis, value) {
    for (var key in gamepad.indices) {
      if (this._axisMoveEqualsKey(axis, key)) {
        gamepad.indices[key](gamepad, axis, value);
      }
    }
  }
}


Gamepads.utils = utils;
