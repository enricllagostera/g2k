# g2k.js

A gamepad-to-keyboard handler for HTML 5 games.

Lots of HTML 5 games already have built-in gamepad support using browser's [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API). Older games often don't. This is a small script for simulating keyboard events from gamepad input in HTML5 games. It currently supports one gamepad. `g2k.js` is loosely based on apps like [JoyToKey](https://joytokey.net/en/) and [antimicro](https://github.com/AntiMicro/antimicro).

## Usage

1. Copy the `g2k.js` file to yout HTML5 game folder.
2. Configure the mapping (more details below), refresh rate and target element in the g2k.js file. 
3. On your main HTML file, add a script tag like the one below, right before closing the `<body>` tag:

    ```html
    <script src="g2k.js"></script>
    ```

## Configuring a mapping

Within the `g2k.js` file, you can change the `mapping` object to configure your controller.

```js
const mapping = {
    axes: [
        { idx: 1, threshold: -0.8, keyCode: 38 }, // Lower values than threshold fire Up Arrow key
        { idx: 1, threshold: 0.8, keyCode: 40 }, // Higher values than threshold fire Down Arrow key
        { idx: 0, threshold: 0.8, keyCode: 39 },
        { idx: 0, threshold: -0.8, keyCode: 37 },
    ],
    buttons: [
        { idx: 0, keyCode: 13 }, // Fires Enter key
        { idx: 15, keyCode: 39 }, // Fires Right Arrow key
        { idx: 14, keyCode: 37 }, // Fires Left Arrow key
        { idx: 12, keyCode: 38 }, // Fires Up Arrow key
        { idx: 13, keyCode: 40 }, // Fires Down Arrow key
    ],
};
```

To figure out the axes or button indexes and threshold values for your specific gamepad device, check https://gamepad-tester.com/. To get `keyCode` values for the keys you are interested in, check the http://keycode.info/ website. These are the keys that will be simulated by `g2k.j`.

### On axes

If an axis `threshold` value is positive, it will send a `keydown` event if the current reading is higher than that threshold value. If the `threshold` is negative, it will send a `keydown` event on a lower value.

### On buttons

If the button with a given index is pressed, it will fire a `keydown` event with the corresponding key code.
