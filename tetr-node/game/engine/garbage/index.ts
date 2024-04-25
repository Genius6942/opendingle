import { calculateIncrease, deepCopy } from "../utils";

export interface GarbageQueueInitializeParams {
  cap: {
    value: number;
    absolute: number;
    max: number;
    increase: number;
  };

  speed: number;
}

export interface Garbage {
  frame: number;
  amount: number;
  size: number;
  column: number;
}

export class GarbageQueue {
  options: GarbageQueueInitializeParams;

  queue: Garbage[];
  constructor(options: GarbageQueueInitializeParams) {
    this.options = options;
    if (!this.options.cap.absolute) this.options.cap.absolute = Infinity;

    this.queue = [];
  }

  get size() {
    return this.queue.reduce((a, b) => a + b.amount, 0);
  }

  cap(frame: number) {
    return calculateIncrease(this.options.cap.value, frame, this.options.cap.increase, 0);
  }

  recieve(...args: Garbage[]) {
    this.queue.push(...args);

    while (this.size > this.options.cap.absolute) {
      const total = this.size;
      if (this.queue.at(-1).amount <= total - this.options.cap.absolute) {
        this.queue.pop();
      } else {
        this.queue.at(-1).amount -= total - this.options.cap.absolute;
      }
    }
  }

  cancel(amount: number) {
    while (amount > 0) {
      if (this.queue.length <= 0) {
        break;
      }

      if (amount >= this.queue[0].amount) {
        amount -= this.queue[0].amount;
        this.queue.shift();
      } else {
        this.queue[0].amount -= amount;
        amount = 0;
        break;
      }
    }

    return amount;
  }

  tank(frame: number) {
    let amount = this.cap(frame);
    const res: Garbage[] = [];
    const tankable = this.queue.filter(
      (garbage) => frame - garbage.frame >= this.options.speed
    );

    this.queue = this.queue.sort((a, b) => a.frame - b.frame);

    while (amount > 0 && tankable.length > 0) {
      if (amount >= this.queue.length) {
        res.push(deepCopy(this.queue.shift()));
        tankable.shift();
      } else {
        this.queue[0].amount -= amount;
        amount = 0;
      }
    }

    return res;
  }
}
