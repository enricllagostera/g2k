# g2k.js

A gamepad-to-keyboard handler for HTML 5 games.

Lots of HTML 5 games already have built-in gamepad support using browser's [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API). Older games often don't. This is a small script for simulating keyboard events from gamepad input in HTML5 games. It supports multiple gamepads. `g2k.js` is loosely based on apps like [JoyToKey](https://joytokey.net/en/) and [antimicro](https://github.com/AntiMicro/antimicro).

## Usage

1. Copy the `g2k.js` file to yout HTML5 game folder.
2. Configure the `mapping` (more details below), `refreshRate` and `targetElement` in the g2k.js file.
3. On your main HTML file, link the g2k.js script, by adding a `<script>` tag like the one below, right before closing the `<body>` tag:

    ```html
    <script src="g2k.js"></script>
    ```
4. (Optional) If you want to add a click or touch-to-fullscreen functionality, you can go to the HTML tag of your game (maybe `canvas` or even `body`) and add the `onclick="g2k.doFullscreen()"` attribute:

    ```html
    // This example game runs on a canvas element
    <canvas onclick="g2k.doFullscreen()"></canvas>
    ```

## Configuration

Within the `g2k.js` file, you can change the `mapping` object to configure your controller.

```js
// Mapping for a one-player game using axes and buttons
const mappings = {
    playerCount: 1, // Total players supported
    devices: [{
        player: 1, // Mapping assigned to player 1
        axes: [
            { index: 1, threshold: -0.8, keyCode: 38 }, // Lower values than threshold fire Up Arrow key
            { index: 1, threshold: 0.8, keyCode: 40 }, // Higher values than threshold fire Down Arrow key
            { index: 0, threshold: 0.8, keyCode: 39 },
            { index: 0, threshold: -0.8, keyCode: 37 },
        ],
        buttons: [
            { index: 0, keyCode: 13 }, // Fires Enter key
            { index: 15, keyCode: 39 }, // Fires Right Arrow key
            { index: 14, keyCode: 37 }, // Fires Left Arrow key
            { index: 12, keyCode: 38 }, // Fires Up Arrow key
            { index: 13, keyCode: 40 }, // Fires Down Arrow key
        ],
    }],
};
```

To figure out the adequate axes or button indexes and threshold values for your specific gamepad device, check https://gamepad-tester.com/. To get `keyCode` values for the keys you are interested in, check the http://keycode.info/ website. These are the keys that will be simulated by `g2k.j`.

If you want multiple controllers, you can add more add more mappings to the `devices` array above. Check the example below:

```js
// Mapping for a two-player game using only buttons
const mappings = {
    playerCount: 2, // Total players supported
    devices: [{
        player: 1, // Mapping assigned to player 1
        axes: [],
        buttons: [
            { index: 0, keyCode: 13 }, // Fires Enter key
            { index: 15, keyCode: 39 }, // Fires Right Arrow key
            { index: 14, keyCode: 37 }, // Fires Left Arrow key
            { index: 12, keyCode: 38 }, // Fires Up Arrow key
            { index: 13, keyCode: 40 }, // Fires Down Arrow key
        ],
    },
    {
        player: 2, // Mapping assigned to player 2
        axes: [],
        buttons: [
            { index: 0, keyCode: 32 }, // Fires Space key
            { index: 15, keyCode: 87 }, // Fires W key
            { index: 14, keyCode: 83 }, // Fires S key
            { index: 12, keyCode: 65 }, // Fires A key
            { index: 13, keyCode: 68 }, // Fires D key
        ],
    }],
};
```

### On axes

If an axis `threshold` value is positive, it will send a `keydown` event if the current reading is higher than that threshold value. If the `threshold` is negative, it will send a `keydown` event on a lower value.

### On buttons

If the button with a given index is pressed, it will fire a `keydown` event with the corresponding key code.
