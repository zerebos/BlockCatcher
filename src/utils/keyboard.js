const tracked = new Set();
const trackedState = {};
const subscriptions = {};


function keyDown(event) {
    if (!tracked.has(event.key)) return;
    event.preventDefault();
    trackedState[event.key] = true;
}

/** @param {KeyboardEvent} event */
function keyUp(event) {
    if (!tracked.has(event.key)) return;
    event.preventDefault();
    trackedState[event.key] = false;
}

/** @param {KeyboardEvent} event */
function keyPress(event) {
    if (!(event.key in subscriptions)) return;
    event.preventDefault();

    const set = subscriptions[event.key];
    for (const callback of set.values()) callback(event);
}

export default new class Keyboard {
    get state() {return trackedState;}

    trackKeys(...keys) {
        for (const key of keys) tracked.add(key);
    }

    untrackKeys(...keys) {
        for (const key of keys) tracked.delete(key);
    }

    subscribe(key, callback) {
        if (!subscriptions[key]) subscriptions[key] = new Set();
        subscriptions[key].add(callback);
    }

    unsubscribe(key, callback) {
        if (!subscriptions[key]) subscriptions[key] = new Set();
        return subscriptions[key].delete(callback);
    }
};

document.addEventListener("keyup", keyUp);
document.addEventListener("keydown", keyDown);
document.addEventListener("keypress", keyPress);