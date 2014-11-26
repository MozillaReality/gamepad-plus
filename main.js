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

var hasEvents = 'ongamepadconnected' in window;
var gamepads = {};
var i = 0;

function gamepadConnected(e) {
  addGamepad(e.gamepad);
}

function addGamepad(gamepad) {
  console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    gamepad.index, gamepad.id, gamepad.buttons.length, gamepad.axes.length);
  gamepads[gamepad.index] = gamepad;
  loop();
}

function gamepadDisconnected(e) {
  removeGamepad(e.gamepad);
}

function removeGamepad(gamepad) {
  delete gamepads[gamepad];
  cancelLoop();
}

function loop() {
  raf(updateStatus);
}

function updateStatus() {
  if (!hasEvents) {
    pollGamepads();
  }

  var j;
  var gp;

  for (j in gamepads) {
    gp = gamepads[j];

    // look at `controller.buttons` and `controller.axes`.
  }

  loop();
}

function cancelLoop() {
  //caf(updateStatus);
}

// todo: check if `mapping` is set to `standard`.

function pollGamepads(polled) {
  var gps = getGamepads();
  var gp;

  for (i = 0; i < gps.length; i++) {
    gp = gps[i];

    if (!gp) {
      return;
    }

    // We have to continue polling because Chrome won't fire
    // `gamepadconnected` if another gamepad is connected.
    // window.cancelInterval(pollInterval);

    if (gp.index in gamepads) {
      gamepads[gp.index] = gp;
    } else {
      addGamepad(gp);
    }
  }
}

function getGamepads() {
  var apis = ['getGamepads', 'webkitGetGamepads', 'webkitGamepads'];
  for (i = 0; i < apis.length; i++) {
    if (apis[i] in navigator) {
      return navigator[apis[i]]();
    }
  }
  return [];
}

var pollInterval;

if (hasEvents) {
  window.addEventListener('gamepadconnected', gamepadConnected);
  window.addEventListener('gamepaddisconnected', gamepadDisconnected);
} else {
  pollInterval = window.setInterval(function () {
    pollGamepads(true);
  }, 100);
}

})();
