(function () {


var raf = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame;

if (!raf) {
  throw 'requestAnimationFrame is required!';
}

var caf = window.cancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame ||
  window.webkitCancelRequestAnimationFrame;


if (!('GamepadButton' in window)) {
  var GamepadButton = window.GamepadButton = function (obj) {
    return {
      pressed: obj.pressed,
      value: obj.value
    };
  };
}


function gamepadConnected(e) {
  console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
  updateStatus();
}

function gamepadDisconnected(e) {
  removeGamepad(e.gamepad);
}

function removeGamepad(gamepad) {
  delete gamepads[gamepad];
  cancelLoop();
}


var Gamepads = function () {
  this._gamepadApis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
  this.gamepadsSupported = this._hasGamepads();

  this.axisThreshold = 0.15;

  this.previous = [];
  this.current = [];
};


Gamepads.prototype._hasGamepads = function () {
  for (var i = 0; i < this._gamepadApis.length; i++) {
    if (this._gamepadApis[i] in navigator) {
      return true;
    }
  }
  return false;
};


Gamepads.prototype._getGamepads = function () {
  for (var i = 0; i < this._gamepadApis.length; i++) {
    if (this._gamepadApis[i] in navigator) {
      return navigator[this._gamepadApis[i]]();
    }
  }
  return [];
};


/**
* @function
* @name Gamepads#update
* @description
*   Update the current and previous state of the gamepads.
*   This must be called every frame for `wasPressed()` to work.
*/
Gamepads.prototype.update = function () {
  var pads = this.poll();

  for (var i = 0; i < pads.length; i++) {
    this.previous[i] = this.current[i];
    this.current[i] = pads[i];
  }
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

    for (var i = 0; i < padsRaw.length; i++) {
      pad = padsRaw[i];

      if (pad) {
        pads.push({
          raw: pad,
          axes: pad.axes.map(this._mapAxis, this),
          buttons: pad.buttons.map(this._mapButton, this)
        });
      }
    }
  }

  return pads;
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
      pressed: button === 1.0,
      value: button
    });
  }

  return button;
};



var gamepads = new Gamepads();

function updateStatus() {
  var pads = gamepads.poll();
  raf(updateStatus);
  return pads;
}

function cancelLoop() {
  if (pollInterval) {
    window.clearInterval(pollInterval);
  }

  caf(updateStatus);
}


var pollInterval;

if ('chrome' in window) {
  pollInterval = window.setInterval(function () {
    var pads = gamepads.poll();

    if (pads.length) {
      console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        pads[0].index, pads[0].id, pads[0].buttons.length, pads[0].axes.length);

      window.clearInterval(pollInterval);
      raf(updateStatus);
    }
  }, 100);
} else {
  window.addEventListener('gamepadconnected', gamepadConnected);
  window.addEventListener('gamepaddisconnected', gamepadDisconnected);
}

})();
