# gamepad-plus 🎮

A superb library that extends the [Gamepad API](https://w3c.github.io/gamepad/gamepad.html) with super powers.


## Features

* polyfill the standard events, when unsupported: `gamepadconnected`, `gamepaddisconnected`
* polyfill the non-standard events, when unsupported: `gamepadbuttondown`, `gamepadbuttonup`, `gamepadaxismove`
* normalise mapping for gamepads in the wild to the [Standard Gamepad layout](https://w3c.github.io/gamepad/gamepad.html#remapping)
* attach an object of attributes about the gamepad and data source


## Developers

Running this command will compile the JavaScript as a standalone module to __`dist/gamepads.js`__:

    npm run build
