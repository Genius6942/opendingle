import { LitElement, html } from "lit";

function shortenNumber(number) {
  return String(number).padStart(3, "0");
}

function convertSeconds(ms) {
  const milliseconds = ms % 1000;
  let seconds = Math.floor(ms / 1000);
  // Calculate the values for days, hours, minutes, and seconds
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  // Create an object to store the converted values
  const timeObject = {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds,
  };

  return timeObject;
}

const releaseTimestamp = 1700671500000;
class App extends LitElement {
  static properties = {
    increment: {},
  };
  constructor() {
    super();
    this.increment = 0;

    const update = () => {
      this.increment++;
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
  createRenderRoot() {
    return this;
  }

  getReleaseTime() {
    return convertSeconds(Math.max(0, releaseTimestamp - Date.now()));
  }

  render() {
    const data = this.getReleaseTime();
    return html`<div
      class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col z-10"
    >
      <div class="text-8xl text-white font-bold">
        ${data.days === 0 &&
        data.hours === 0 &&
        data.minutes === 0 &&
        data.seconds === 0
          ? "Coming very soon!"
          : html`<strong class="font-mono -mt-3 text-9xl">${data.days}</strong>
              day${data.days === 1 ? "" : "s"}
              <br />
              <strong class="font-mono -mt-3 text-9xl">${data.hours}</strong>
              hour${data.hours === 1 ? "" : "s"}
              <br />
              <strong class="font-mono -mt-3 text-9xl">${data.minutes}</strong>
              minute${data.minutes === 1 ? "" : "s"}
              <br />
              <strong class="font-mono -mt-3 text-9xl"
                >${data.seconds}.${shortenNumber(data.milliseconds)}</strong
              >
              seconds
              <br />
              <div class="text-4xl">Until official release!</div>`}
      </div>
    </div>`;
  }
}

customElements.define("my-app", App);
