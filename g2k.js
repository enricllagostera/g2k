/*

# g2k.js - Gamepad-to-keyboard handler

A small script for simulating keyboard events when gamepads are used in HTML5 games. This is helpful to support gamepads on HTML5 games that do not use the Gamepad API. It currently supports only one gamepad. Based on apps like JoyToKey.

## Preparing a mapping

To get the axes or button indexes for your specific gamepad device, check https://gamepad-tester.com/.
To get keyCode values, check the http://keycode.info/ website. These are the keys that will be simulated.

### On axes

If axis threshold is positive, it will send a keydown event if the current reading is higher than the threshold value. If threshold is negative, it will send a keydown event on lover values. 

### On buttons

If the button with a given index is pressed, it will fire a keydown event with the corresponding keyCode.

*/

const g2k = (function () {
  const mapping = {
    axes: [
      { idx: 1, threshold: -0.8, keyCode: 38 },
      { idx: 1, threshold: 0.8, keyCode: 40 },
      { idx: 0, threshold: 0.8, keyCode: 39 },
      { idx: 0, threshold: -0.8, keyCode: 37 },
    ],
    buttons: [
      { idx: 0, keyCode: 13 }, // Enter
      { idx: 15, keyCode: 39 }, // Right
      { idx: 14, keyCode: 37 }, // Left
      { idx: 12, keyCode: 38 }, // Up
      { idx: 13, keyCode: 40 }, // Down
    ],
  };
  const refreshRate = 20; // In milliseconds. Bitsy games work better with a larger number (e.g. 60).
  const targetElement = document; // This depends on how the game you are running handles keyboard input. Useful values: window (Clickteam games), document (older Bitsy games).

  var gamepad = false;

  window.addEventListener("gamepadconnected", function (e) {
    gamepad = navigator.getGamepads()[e.gamepad.index];
  });

  window.addEventListener("gamepaddisconnected", function (e) {
    gamepad = false;
  });

  function handleGamepad(elapsed) {
    if (gamepad == false) {
      return;
    }

    var eventsToFire = [];

    for (let i = 0; i < mapping.buttons.length; i++) {
      const currentButton = mapping.buttons[i];
      if (gamepad.buttons[currentButton.idx].pressed) {
        eventsToFire.push(
          new KeyboardEvent("keydown", { keyCode: currentButton.keyCode })
        );
      } else {
        eventsToFire.push(
          new KeyboardEvent("keyup", { keyCode: currentButton.keyCode })
        );
      }
    }

    for (let i = 0; i < mapping.axes.length; i++) {
      const currentAxis = mapping.axes[i];
      if (currentAxis.threshold > 0.0) {
        // checks for higher values
        if (gamepad.axes[currentAxis.idx] > currentAxis.threshold) {
          eventsToFire.push(
            new KeyboardEvent("keydown", { keyCode: currentAxis.keyCode })
          );
        }
      } else if (currentAxis.threshold < 0.0) {
        // checks for lower values
        if (gamepad.axes[currentAxis.idx] < currentAxis.threshold) {
          eventsToFire.push(
            new KeyboardEvent("keydown", { keyCode: currentAxis.keyCode })
          );
        }
      }
    }

    eventsToFire
      .sort((a, b) => a.keyCode > b.keyCode)
      .map((item) => targetElement.dispatchEvent(item));
  }

  setInterval(handleGamepad, refreshRate);
})();
