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
  const mappings = {
    playerCount: 1,
    devices: [
      {
        player: 1,
        axes: [
          { index: 1, threshold: -0.8, keyCode: 38 },
          { index: 1, threshold: 0.8, keyCode: 40 },
          { index: 0, threshold: 0.8, keyCode: 39 },
          { index: 0, threshold: -0.8, keyCode: 37 },
        ],
        buttons: [
          { index: 0, keyCode: 13 }, // Enter
          { index: 12, keyCode: 38 }, // Up
          { index: 13, keyCode: 40 }, // Down
          { index: 14, keyCode: 37 }, // Left
          { index: 15, keyCode: 39 }, // Right
        ],
      },
    ],
  };
  const refreshRate = 20; // In milliseconds. Bitsy games work better with a larger number (e.g. 60).
  const targetElement = window; // This depends on how the game you are running handles keyboard input. Useful values: window (Clickteam games), document (older Bitsy games).
  const ua = navigator.userAgent;
  let browserMode = "firefox";
  let gamepads = {};
  let connectedGamepads = new Set();

  function doFullscreen() {
    document.querySelector("body").requestFullscreen();
  }

  function getClearState(player) {
    let previousState = {};
    let map = mappings.devices.find((d) => d.player == player);
    if (map == undefined) {
      console.warn("No mapping for player " + player);
      return;
    }
    previousState.axes = new Array(...map.axes);
    previousState.buttons = new Array(...map.buttons);
    previousState.axes.forEach((a) => (a.pressed = false));
    previousState.buttons.forEach((b) => (b.pressed = false));
    return previousState;
  }

  function getCurrentState(gamepad) {
    let currentState = {};
    let tmp = {};
    let device = mappings.devices.find((d) => d.player == gamepad.player);
    if (device === undefined) {
      console.warn("No device mapping for player " + gamepad.player);
      return;
    }
    currentState.axes = [];
    device.axes.forEach((axis) => {
      // Check if axis index exists in controller device
      if (gamepad.reading.axes.length <= axis.index || axis.index < 0) {
        return;
      }
      const readValue = gamepad.reading.axes[axis.index];
      // Decide pressed value depending on threshold direction & read value
      axis.pressed =
        axis.threshold > 0
          ? axis.threshold < readValue
          : axis.threshold > readValue;
      currentState.axes.push({ ...axis });
    });

    currentState.buttons = [];
    device.buttons.forEach((button) => {
      // Check if button index exists in controller device
      if (gamepad.reading.buttons.length <= button.index || button.index < 0) {
        return;
      }
      button.pressed = gamepad.reading.buttons[button.index].pressed;
      currentState.buttons.push({ ...button });
    });
    return currentState;
  }

  function getEventsFromStates(previousState, currentState) {
    let events = [];
    currentState.axes.forEach((axis, idx) => {
      if (axis.pressed) {
        if (!previousState.axes[idx].pressed) {
          events.push(new KeyboardEvent("keydown", { keyCode: axis.keyCode }));
        }
      } else {
        if (previousState.axes[idx].pressed) {
          events.push(new KeyboardEvent("keyup", { keyCode: axis.keyCode }));
        }
      }
    });
    currentState.buttons.forEach((button, idx) => {
      if (button.pressed && !previousState.buttons[idx].pressed) {
        events.push(new KeyboardEvent("keydown", { keyCode: button.keyCode }));
      }
      if (!button.pressed && previousState.buttons[idx].pressed) {
        events.push(new KeyboardEvent("keyup", { keyCode: button.keyCode }));
      }
    });
    return events;
  }

  function handleConnection(event, isConnecting) {
    if (isConnecting) {
      if (connectedGamepads.size >= mappings.playerCount) {
        return;
      }
      connectedGamepads.add(event.gamepad.index);
      gamepads[event.gamepad.index] = {
        player: connectedGamepads.size,
        reading: event.gamepad,
        previousState: getClearState(connectedGamepads.size),
      };
    } else {
      if (!connectedGamepads.has(event.gamepad.index)) {
        return;
      }
      connectedGamepads.delete(event.gamepad.index);
      delete gamepads[event.gamepad.index];
    }
  }

  function handleGamepads(elapsed) {
    // No gamepads are connected.
    if (connectedGamepads.size == 0) {
      return;
    }

    let eventsToFire = [];
    connectedGamepads.forEach((idx) => {
      if (browserMode == "chrome") {
        gamepads[idx].reading = navigator.getGamepads()[idx];
      }
      let currentState = getCurrentState(gamepads[idx]);
      eventsToFire.push(
        ...getEventsFromStates(gamepads[idx].previousState, currentState)
      );
      gamepads[idx].previousState.axes = new Array(...currentState.axes);
      gamepads[idx].previousState.buttons = new Array(...currentState.buttons);
    });
    // Fire all queued keyboard events
    eventsToFire
      .sort((a, b) => a.keyCode > b.keyCode)
      .map((item) => targetElement.dispatchEvent(item));
  }

  function setup() {
    if (ua.toLowerCase().indexOf("chrome") != -1) {
      // console.log("IS CHROME");
      browserMode = "chrome";
    }
    window.addEventListener("gamepadconnected", (e) =>
      handleConnection(e, true)
    );
    window.addEventListener("gamepaddisconnected", (e) =>
      handleConnection(e, false)
    );
    setInterval(handleGamepads, refreshRate);
  }

  setup();

  return {
    doFullscreen: () => {
      document.querySelector("body").requestFullscreen();
    },
  };
})();
