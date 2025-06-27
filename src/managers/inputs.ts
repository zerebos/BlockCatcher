const tracked = new Set<string>();
const trackedState: Record<string, boolean> = {};
const subscriptions: Record<string, Set<(event: KeyboardEvent) => void>> = {};


function keyDown(event: KeyboardEvent) {
    if (!tracked.has(event.key)) return;
    event.preventDefault();
    trackedState[event.key] = true;
}


function keyUp(event: KeyboardEvent) {
    if (!tracked.has(event.key)) return;
    event.preventDefault();
    trackedState[event.key] = false;
}


function keyPress(event: KeyboardEvent) {
    if (!(event.key in subscriptions)) return;
    event.preventDefault();

    const set = subscriptions[event.key];
    for (const callback of set.values()) callback(event);
}


export default new class Keyboard {
    get state() {return trackedState;}

    trackKeys(...keys: string[]) {
        for (const key of keys) tracked.add(key);
    }

    untrackKeys(...keys: string[]) {
        for (const key of keys) tracked.delete(key);
    }

    subscribe(key: string, callback: (event: KeyboardEvent) => void) {
        if (!subscriptions[key]) subscriptions[key] = new Set();
        subscriptions[key].add(callback);
    }

    unsubscribe(key: string, callback: (event: KeyboardEvent) => void) {
        if (!subscriptions[key]) subscriptions[key] = new Set();
        return subscriptions[key].delete(callback);
    }
};

document.addEventListener("keyup", keyUp);
document.addEventListener("keydown", keyDown);
document.addEventListener("keypress", keyPress);