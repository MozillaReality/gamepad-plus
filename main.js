(function (window) {

function clone(obj) {
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
      ret[i] = clone(obj[i]);
    }
    return ret;
  }

  if (obj instanceof Object) {
    ret = {};
    for (var attr in obj) {
      if (attr in obj) {
        ret[attr] = clone(obj[attr]);
      }
    }
    return ret;
  }

  throw new Error('Unable to clone object of unexpected type!');
}


if (!('performance' in window)) {
  window.performance = {};
}

if (!('now' in window.performance)) {
  window.performance.now = function () {
    return +new Date();
  };
}


var utils = {};

utils.getBrowser = function () {
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
  } else if (/*@cc_on!@*/false || !!document.documentMode) {
    // At least IE6.
    return 'ie';
  }
};

utils.browser = utils.getBrowser();

utils.getEngine = function (browser) {
  browser = browser || utils.getBrowser();

  if (browser === 'firefox') {
    return 'gecko';
  } else {
    return 'webkit';
  }
};

utils.engine = utils.getEngine(utils.browser);

utils.stripLeadingZeros = function (str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/^0+(?=\d+)/g, '');
};

utils.triggerEvent = function (el, name, data) {
  data = data || {};
  data.detail = data.detail || {};

  var event;

  if ('CustomEvent' in window) {
    event = new CustomEvent(name, data.detail);
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, data.bubbles, data.cancelable, data.detail);
  }

  Object.keys(data.detail).forEach(function (key) {
    event[key] = data.detail[key];
  });

  el.dispatchEvent(event);
};


if (!('GamepadButton' in window)) {
  var GamepadButton = window.GamepadButton = function (obj) {
    return {
      pressed: obj.pressed,
      value: obj.value
    };
  };
}


var Gamepads = function (opts) {
  var self = this;

  if (!(self instanceof Gamepads)) {
    return new Gamepads(opts);
  }

  self._allowedOpts = [
    'gamepadAttributesEnabled',
    'nonstandardEventsEnabled',
    'axisThreshold',
    'indices'
  ];
  self._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
  self._gamepadEvents = ['gamepadconnected', 'gamepaddisconnected'];
  self._seenEvents = {};

  self.axisThreshold = 0.15;
  self.dataSource = this.getGamepadDataSource();
  self.gamepadAttributesEnabled = true;
  self.gamepadsSupported = self._hasGamepads();
  self.indices = {};
  self.nonstandardEventsEnabled = true;
  self.previousState = {};
  self.state = {};

  var addSeenEvent = function (e) {
    self.addSeenEvent(e.gamepad, e);
  };

  self._gamepadEvents.forEach(function (eventName) {
    window.addEventListener(eventName, addSeenEvent);
  });

  opts = opts || {};
  Object.keys(opts).forEach(function (key) {
    if (self._allowedOpts.indexOf(key) !== -1) {
      if (typeof opts[key] === 'object') {
        self[key] = clone(opts[key]);
      } else {
        self[key] = opts[key];
      }
    }
  });
};


Gamepads.prototype._getVendorProductIds = function (gamepad) {
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
};


Gamepads.prototype._hasGamepads = function () {
  for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
    if (this._gamepadApis[i] in navigator) {
      return true;
    }
  }
  return false;
};


Gamepads.prototype._getGamepads = function () {
  for (var i = 0, len = this._gamepadApis.length; i < len; i++) {
    if (this._gamepadApis[i] in navigator) {
      return navigator[this._gamepadApis[i]]();
    }
  }
  return [];
};


Gamepads.prototype.addGamepad = Gamepads.prototype.updateGamepad = function (gamepad) {
  gamepad = gamepad || Gamepads.defaultState;

  this.previousState[gamepad.index] = clone(this.state[gamepad.index] || Gamepads.defaultState);
  this.state[gamepad.index] = clone(gamepad);

  if (!this.hasSeenEvent(gamepad, {type: 'gamepadconnected'})) {
    this.fireConnectionEvent(gamepad, true);
  }
};


Gamepads.prototype.existsGamepad = function (gamepad) {
  return gamepad.index in this.state;
};


Gamepads.prototype.removeGamepad = function (gamepad) {
  delete this.state[gamepad.index];

  if (!this.hasSeenEvent(gamepad, {type: 'gamepaddisconnected'})) {
    this.removeSeenEvent(gamepad, {type: 'gamepadconnected'});
    this.fireConnectionEvent(gamepad, false);
  }
};


Gamepads.prototype.observeButtonChanges = function (gamepad) {
  var self = this;

  var previousPad = self.previousState[gamepad.index];
  var currentPad = self.state[gamepad.index];

  if (!previousPad || !Object.keys(previousPad).length ||
      !currentPad || !Object.keys(currentPad).length) {
    return;
  }

  currentPad.buttons.forEach(function (button, buttonIdx) {
    // Fire non-standard events, if needed.
    if (button.value !== previousPad.buttons[buttonIdx].value) {
      self.fireButtonEvent(currentPad, buttonIdx, button.value);
    }
  });
};


Gamepads.prototype.observeAxisChanges = function (gamepad) {
  var self = this;

  var previousPad = self.previousState[gamepad.index];
  var currentPad = self.state[gamepad.index];

  if (!previousPad || !Object.keys(previousPad).length ||
      !currentPad || !Object.keys(currentPad).length) {
    return;
  }

  currentPad.axes.forEach(function (axis, axisIdx) {
    // Fire non-standard events, if needed.
    if (axis !== previousPad.axes[axisIdx]) {
      self.fireAxisMoveEvent(currentPad, axisIdx, axis);
    }
  });
};


Gamepads.defaultState = {
  buttons: new Array(17),
  axes: [0.0, 0.0, 0.0, 0.0]
};
for (var i = 0; i < 17; i++) {
  Gamepads.defaultState.buttons[i] = {
    pressed: false,
    value: 0.0
  };
}


/**
 * @function
 * @name Gamepads#update
 * @description
 *   Update the current and previous states of the gamepads.
 *   This must be called every frame for events to work.
 */
Gamepads.prototype.update = function () {
  var self = this;
  var previousPad;
  var currentPad;

  self.poll().forEach(function (pad) {
    // Add/update connected gamepads (and fire polyfilled events, if needed).
    self.updateGamepad(pad);

    // Fire polyfilled non-standard events, if needed.
    self.observeButtonChanges(pad);
    self.observeAxisChanges(pad);
  });

  Object.keys(self.previousState).forEach(function (padIdx) {
    previousPad = self.previousState[padIdx];
    currentPad = self.state[padIdx];

    // Remove disconnected gamepads (and fire polyfilled events, if needed).
    if (previousPad && self.existsGamepad(previousPad) &&
        !self.existsGamepad(currentPad)) {

      self.removeGamepad(previousPad);
    }
  });
};


/**
 * @function
 * @name Gamepads#getGamepadDataSource
 * @description Get gamepad data source (e.g., linuxjoy, hid, dinput, xinput).
 * @returns {String} A string of gamepad data source.
 */
Gamepads.prototype.getGamepadDataSource = function () {
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
    // TODO: Determine when `xinput` is used.
  }
  return dataSource;
};


/**
 * @function
 * @name Gamepads#poll
 * @description Poll for the latest data from the gamepad API.
 * @returns {Array} An array of gamepads and mappings for the model of the connected gamepad.
 * @example
 *   var gamepads = new Gamepads();
 *   var pads = gamepads.poll();
 */
Gamepads.prototype.poll = function () {
  var pads = [];

  if (this.gamepadsSupported) {
    var padsRaw = this._getGamepads();
    var pad;

    for (var i = 0, len = padsRaw.length; i < len; i++) {
      pad = padsRaw[i];

      if (!pad) {
        continue;
      }

      if (this.gamepadAttributesEnabled) {
        pad.attributes = this._getAttributes(pad);
      }

      if (!pad.timestamp) {
        pad.timestamp = window.performance.now();
      }

      pad.indices = this._getIndices(pad);

      pads.push(pad);
    }
  }

  return pads;
};


/**
 * @function
 * @name Gamepads#_getAttributes
 * @description Generate and return the attributes of a gamepad.
 * @param {Object} gamepad The gamepad object.
 * @returns {Object} The attributes for this gamepad.
 */
Gamepads.prototype._getAttributes = function (gamepad) {
  var padIds = this._getVendorProductIds(gamepad);
  return {
    vendorId: padIds[0],
    productId: padIds[1],
    name: gamepad.id,
    dataSource: this.dataSource
  };
};


/**
 * @function
 * @name Gamepads#_getIndices
 * @description Return the named indices of a gamepad.
 * @param {Object} gamepad The gamepad object.
 * @returns {Object} The named indices for this gamepad.
 */
Gamepads.prototype._getIndices = function (gamepad) {
  return this.indices[gamepad.id] || this.indices.standard || {};
};


/**
 * @function
 * @name Gamepads#_mapAxis
 * @description Set the value for one of the analogue axes of the pad.
 * @param {Number} axis The button to get the value of.
 * @returns {Number} The value of the axis between -1 and 1.
 */
Gamepads.prototype._mapAxis = function (axis) {
  if (Math.abs(axis) < this.axisThreshold) {
    return 0;
  }

  return axis;
};


/**
 * @function
 * @name Gamepads#_mapButton
 * @description Set the value for one of the buttons of the pad.
 * @param {Number} button The button to get the value of.
 * @returns {Object} An object resembling a `GamepadButton` object.
 */
Gamepads.prototype._mapButton = function (button) {
  if (typeof button === 'number') {
    // Old versions of the API used to return just numbers instead
    // of `GamepadButton` objects.
    button = new GamepadButton({
      pressed: button === 1,
      value: button
    });
  }

  return button;
};


Gamepads.prototype.setIndices = function (indices) {
  this.indices = clone(indices);
};


Gamepads.prototype.fireConnectionEvent = function (gamepad, connected) {
  var name = connected ? 'gamepadconnected' : 'gamepaddisconnected';
  var data = {
    bubbles: false,
    cancelable: false,
    detail: {
      gamepad: gamepad
    }
  };
  utils.triggerEvent(window, name, data);
};


Gamepads.prototype.fireButtonEvent = function (gamepad, button, value) {
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
};


Gamepads.prototype.fireAxisMoveEvent = function (gamepad, axis, value) {
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
};


Gamepads.prototype.addSeenEvent = function (gamepad, e) {
  if (typeof this._seenEvents[gamepad.index] === 'undefined') {
    this._seenEvents[gamepad.index] = {};
  }

  this._seenEvents[gamepad.index][e.type] = e;
};


Gamepads.prototype.hasSeenEvent = function (gamepad, e) {
  if (this._seenEvents[gamepad.index]) {
    return e.type in this._seenEvents[gamepad.index];
  }

  return false;
};


Gamepads.prototype.removeSeenEvent = function (gamepad, e) {
  if (e.type) {
    if (this._seenEvents[gamepad.index]) {
      delete this._seenEvents[gamepad.index][e.type];
    }
  } else {
    delete this._seenEvents[gamepad.index];
  }
};


window.Gamepads = Gamepads;
window.utils = utils;

})(window);
