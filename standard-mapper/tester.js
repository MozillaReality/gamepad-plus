(function (window) {

function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return Array.prototype.slice.call(document.querySelectorAll(sel));
}

var tester = {
  // If the number exceeds this in any way, we treat the label as active
  // and highlight it.
  VISIBLE_THRESHOLD: 0.1,

  // How far can a stick move on screen.
  STICK_OFFSET: 25,

  // How "deep" does an analogue button need to be depressed to consider it
  // a button down.
  ANALOGUE_BUTTON_THRESHOLD: 0.5,

  init: function () {
    tester.updateMode();
    tester.updateGamepads();
  },

  /**
   * Tell the user the browser doesn't support Gamepad API.
   */
  showNotSupported: function () {
    $('#no-gamepad-support').classList.add('visible');
  },

  /**
   * Update the mode (visual vs. raw) if any of the radio buttons were
   * pressed.
   */
  updateMode: function () {
    var gamepadsEl = $('#gamepads');
    if ($('#mode-raw').checked) {
      gamepadsEl.classList.add('raw');
    } else {
      gamepadsEl.classList.remove('raw');
    }
  },

  /**
   * Update the gamepads on the screen, creating new elements from the
   * template.
   */
  updateGamepads: function (gamepads) {
    var el;
    var els = $$('#gamepads .gamepad');
    var extraAxisId;
    var extraButtonId;
    var extraInputsEl;
    var gamepadsEl = $('#gamepads');
    var labelEl;
    var padsConnected = false;

    els.forEach(function (el) {
      el.parentNode.removeChild(el);
    });

    if (gamepads) {
      gamepads.forEach(function (gamepad, idx) {
        if (!gamepad) {
          return;
        }

        el = document.createElement('li');

        // Copy from the template.
        el.appendChild(document.importNode(window['gamepad-template'].content, true));

        el.id = 'gamepad-' + idx;
        el.className = 'gamepad';
        el.querySelector('.name').innerHTML = gamepad.id;
        el.querySelector('.index').innerHTML = gamepad.index;

        gamepadsEl.appendChild(el);

        extraInputsEl = el.querySelector('.extra-inputs');

        // Create extra elements for extraneous buttons.
        extraButtonId = window.gamepadSupport.TYPICAL_BUTTON_COUNT;
        while (typeof gamepad.buttons[extraButtonId] !== 'undefined') {
          labelEl = document.createElement('label');
          labelEl.setAttribute('for', 'extra-button-' + extraButtonId);
          labelEl.setAttribute('description', extraInputsEl.dataset.nameExtraButton);
          labelEl.setAttribute('access', 'buttons[' + extraButtonId + ']');

          extraInputsEl.appendChild(labelEl);

          extraButtonId++;
        }

        // Create extra elements for extraneous sticks.
        extraAxisId = window.gamepadSupport.TYPICAL_AXIS_COUNT;
        while (typeof gamepad.axes[extraAxisId] !== 'undefined') {
          labelEl = document.createElement('label');
          labelEl.setAttribute('for', 'extra-axis-' + extraAxisId);
          labelEl.setAttribute('description', extraInputsEl.dataset.nameExtraAxis);
          labelEl.setAttribute('access', 'axes[' + extraAxisId + ']');

          extraInputsEl.appendChild(labelEl);

          extraAxisId++;
        }

        padsConnected = true;
      });
    }

    var elNoGamepadsConnected = $('#no-gamepads-connected');

    if (padsConnected) {
      elNoGamepadsConnected.classList.remove('visible');
    } else {
      elNoGamepadsConnected.classList.add('visible');
    }
  },

  /**
   * Update a given button on the screen.
   */
  updateButton: function (button, gamepadId, id) {
    var gamepadEl = $('#gamepad-' + gamepadId);

    var value, pressed;

    // Older version of the gamepad API provided buttons as a floating point
    // value from 0 to 1. Newer implementations provide GamepadButton objects,
    // which contain an analog value and a pressed boolean.
    if (typeof(button) === 'object') {
      value = button.value;
      pressed = button.pressed;
    } else {
      value = button;
      pressed = button > tester.ANALOGUE_BUTTON_THRESHOLD;
    }

    // Update the button visually.
    var buttonEl = gamepadEl.querySelector('[name="' + id + '"]');
    if (buttonEl) { // Extraneous buttons have just a label.
      if (pressed) {
        buttonEl.classList.add('pressed');
      } else {
        buttonEl.classList.remove('pressed');
      }
    }

    // Update its label.
    var labelEl = gamepadEl.querySelector('label[for="' + id + '"]');
    if (typeof value === 'undefined') {
      labelEl.innerHTML = '?';
    } else {
      labelEl.innerHTML = value.toFixed(2);

      if (value > tester.VISIBLE_THRESHOLD) {
        labelEl.classList.add('visible');
      } else {
        labelEl.classList.remove('visible');
      }
    }
  },

  /**
   * Update a given analogue stick on the screen.
   */
  updateAxis: function (value, gamepadId, labelId, stickId, horizontal) {
    var gamepadEl = $('#gamepad-' + gamepadId);

    // Update the stick visually.

    var stickEl = gamepadEl.querySelector('[name="' + stickId + '"]');
    if (stickEl) { // Extraneous sticks have just a label.
      var offsetVal = value * tester.STICK_OFFSET;

      if (horizontal) {
        stickEl.style.marginLeft = offsetVal + 'px';
      } else {
        stickEl.style.marginTop = offsetVal + 'px';
      }
    }

    // Update its label.

    var labelEl = gamepadEl.querySelector('label[for="' + labelId + '"]');
    if (typeof value === 'undefined') {
      labelEl.innerHTML = '?';
    } else {
      labelEl.innerHTML = value.toFixed(2);

      if (value < -tester.VISIBLE_THRESHOLD ||
          value > tester.VISIBLE_THRESHOLD) {

        labelEl.classList.add('visible');

        if (value > tester.VISIBLE_THRESHOLD) {
          labelEl.classList.add('positive');
        } else {
          labelEl.classList.add('negative');
        }
      } else {
        labelEl.classList.remove('visible');
        labelEl.classList.remove('positive');
        labelEl.classList.remove('negative');
      }
    }
  }
};

window.tester = tester;

})(window);
