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
  buttons: new Array(17),
  axes: [0.0, 0.0, 0.0, 0.0]
};

for (var i = 0; i < 17; i++) {
  DEFAULT_STATE.buttons[i] = {
    pressed: false,
    value: 0.0
 };
}


export default class Gamepads {
  constructor(config) {
    this.polyfill();

    this._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
    this._gamepadEvents = ['gamepadconnected', 'gamepaddisconnected'];
    this._seenEvents = {};

    this.dataSource = this.getGamepadDataSource();
    this.gamepadsSupported = this._hasGamepads();
    this.indices = {};
    this.keyEvents = {};
    this.previousState = {};
    this.state = {};

    var addSeenEvent = (e) => {
      this.addSeenEvent(e.gamepad, e);
    };

    this._gamepadEvents.forEach((eventName) => {
      window.addEventListener(eventName, addSeenEvent);
    });

    config = config || {};
    Object.keys(DEFAULT_CONFIG).forEach((key) => {
      this[key] = typeof config[key] === 'undefined' ? DEFAULT_CONFIG[key] : utils.clone(config[key]);
    });
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

  _hasGamepads() {
    for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
      if (this._gamepadApis[i] in navigator) {
        return true;
      }
    }
    return false;
  }

  _getGamepads() {
    for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
      if (this._gamepadApis[i] in navigator) {
        return navigator[this._gamepadApis[i]]();
      }
    }
    return [];
  }

  updateGamepad(gamepad) {
    gamepad = gamepad || DEFAULT_STATE;

    this.previousState[gamepad.index] = utils.clone(this.state[gamepad.index] || DEFAULT_STATE);
    this.state[gamepad.index] = utils.clone(gamepad);

    if (!this.hasSeenEvent(gamepad, {type: 'gamepadconnected'})) {
      this.fireConnectionEvent(gamepad, true);
    }
  }

  existsGamepad(gamepad) {
    return gamepad.index in this.state;
  }

  removeGamepad(gamepad) {
    delete this.state[gamepad.index];

    if (!this.hasSeenEvent(gamepad, {type: 'gamepaddisconnected'})) {
      this.removeSeenEvent(gamepad, {type: 'gamepadconnected'});
      this.fireConnectionEvent(gamepad, false);
    }
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
        // Fire non-standard events, if needed.
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
      // Fire non-standard events, if needed.
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
    var previousPad;
    var currentPad;

    this.poll().forEach((pad) => {
      // Add/update connected gamepads (and fire polyfilled events, if needed).
      this.updateGamepad(pad);

      // Fire polyfilled non-standard events, if needed.
      this.observeButtonChanges(pad);
      this.observeAxisChanges(pad);
    });

    Object.keys(this.previousState).forEach((padIdx) => {
      previousPad = this.previousState[padIdx];
      currentPad = this.state[padIdx];

      // Remove disconnected gamepads (and fire polyfilled events, if needed).
      if (previousPad && this.existsGamepad(previousPad) &&
          !this.existsGamepad(currentPad)) {

        this.removeGamepad(previousPad);
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
    var data = {
      bubbles: false,
      cancelable: false,
      detail: {
        gamepad: gamepad
      }
    };
    utils.triggerEvent(window, name, data);
  }

  fireKeyEvent(gamepad, button, value) {
    if (!this.keyEventsEnabled) {
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

  fireButtonEvent(gamepad, button, value) {
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

  fireAxisMoveEvent(gamepad, axis, value) {
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


  addSeenEvent(gamepad, e) {
    if (typeof this._seenEvents[gamepad.index] === 'undefined') {
      this._seenEvents[gamepad.index] = {};
    }

    this._seenEvents[gamepad.index][e.type] = e;
  }

  hasSeenEvent(gamepad, e) {
    if (this._seenEvents[gamepad.index]) {
      return e.type in this._seenEvents[gamepad.index];
    }

    return false;
  }

  removeSeenEvent(gamepad, e) {
    if (e.type) {
      if (this._seenEvents[gamepad.index]) {
        delete this._seenEvents[gamepad.index][e.type];
      }
    } else {
      delete this._seenEvents[gamepad.index];
    }
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
}


Gamepads.utils = utils;
