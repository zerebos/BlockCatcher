export const TICK = 0;
export const DONE = 1;

// In case we need a more advanced timer for the game with a cleaner api
export default class Timer {
    constructor(initialTime, timeInterval) {
        if (initialTime % timeInterval != 0) throw new Error("Time must divide evenly");
        this.running = false;
        this.timeLeft = initialTime;
        this.interval = timeInterval;
        this.listeners = new Set();
    }

    addListener(listener) {
        this.listeners.add(listener);
    }

    setTime(newTime) {
        if (newTime % this.interval != 0) throw new Error("New time does not divide evenly by interval");
        this.timeLeft = newTime;
    }

    addTime(additionalTime) {
        if (this.timeLeft + additionalTime % this.interval != 0) throw new Error("New time does not divide evenly by interval");
        this.timeLeft += additionalTime;
    }

    setInterval(newInterval) {
        if (this.timeLeft % newInterval != 0) throw new Error("New interval does not divide time evenly");
        this.interval = newInterval;
    }

    startTimer() {
        this.timer = setInterval(() => this.run(), this.interval * 1000);
        this.running = true;
    }

    stopTimer() {
        clearInterval(this.timer);
        this.running = false;
    }

    run() {
        this.timeLeft -= this.interval;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.stopTimer();
            for (const listener of this.listeners) listener(DONE);
        }
        else {
            for (const listener of this.listeners) listener(TICK);
        }
    }
}
  