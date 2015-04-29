(function (window) {

var raf = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame;

if (!raf) {
  throw 'requestAnimationFrame is required!';
}

var caf = window.cancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame ||
  window.webkitCancelRequestAnimationFrame;


var gamepads = new Gamepads();
gamepads.polling = false;

if (gamepads.gamepadsSupported) {
  gamepads.updateStatus = function () {
    gamepads.polling = true;
    gamepads.update();
    raf(gamepads.updateStatus);
  };

  gamepads.cancelLoop = function () {
    gamepads.polling = false;

    if (gamepads.nonFirefoxInterval) {
      window.clearInterval(gamepads.nonFirefoxInterval);
    }

    caf(gamepads.updateStatus);
  };


  var gamepadConnected = function (e) {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
      e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);

    gamepads.updateStatus();
  };

  var gamepadDisconnected = function (e) {
    console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
  };

  window.addEventListener('gamepadconnected', gamepadConnected);
  window.addEventListener('gamepaddisconnected', gamepadDisconnected);

  if (gamepads.nonstandardEventsEnabled) {
    var gamepadButtonDown = function (e) {
      console.log('Gamepad button down at index %d: %s. Button: %d.',
        e.gamepad.index, e.gamepad.id, e.button);
    };

    var gamepadButtonUp = function (e) {
      console.log('Gamepad button up at index %d: %s. Button: %d.',
        e.gamepad.index, e.gamepad.id, e.button);
    };

    var gamepadAxisMove = function (e) {
      console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
        e.gamepad.index, e.gamepad.id, e.axis, e.value);
    };

    window.addEventListener('gamepadbuttondown', gamepadButtonDown);
    window.addEventListener('gamepadbuttonup', gamepadButtonUp);

    window.addEventListener('gamepadaxismove', gamepadAxisMove);
  }

  // At the time of this writing, Firefox is the only browser that correctly
  // fires the `gamepadconnected` event. For the other browsers
  // <https://crbug.com/344556>, we start polling every 100ms until the
  // first gamepad is connected.
  if (utils.browser !== 'firefox') {
    gamepads.nonFirefoxInterval = window.setInterval(function () {
      if (gamepads.poll().length) {
        gamepads.updateStatus();
        window.clearInterval(gamepads.nonFirefoxInterval);
      }
    }, 100);
  }
}

window.gamepads = gamepads;

})(window);
