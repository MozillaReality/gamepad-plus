# gamepad-plus 🎮

A superb library that extends the [Gamepad API](https://w3c.github.io/gamepad/gamepad.html) with super powers.


## Features

* polyfill the standard events, when unsupported: `gamepadconnected`, `gamepaddisconnected`
* polyfill the non-standard events, when unsupported: `gamepadbuttondown`, `gamepadbuttonup`, `gamepadaxismove`
* normalise mapping for gamepads in the wild to the [Standard Gamepad layout](https://w3c.github.io/gamepad/gamepad.html#remapping)
* attach an object of attributes about the gamepad and data source


## Example

[View example of sample usage](https://mozvr.github.io/gamepad-plus/) ([source](https://github.com/MozVR/gamepad-plus/blob/master/demo.js))


## Developers

Run this command to compile the JavaScript as a standalone module to __`dist/gamepads.js`__:

    npm run build


## Maintainers

Run this command to publish a new tag to GitHub and version to npm:

    npm run release
