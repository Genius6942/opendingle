// @ts-check

import { LitElement, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { io } from "socket.io-client";
import { Notyf } from "notyf";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
/**
 * @type {Notyf}
 */
const notify = new Notyf();

const renderLevelNumber = (number, additionalAttribs = "") => {
  const displayedLevel = Math.floor(number);
  const fraction = number % 1;

  if (displayedLevel >= 5000) {
    // Give them the golden tag
    return `<div class="leveltag ns lt_golden">${displayedLevel}</div>`;
  }

  const shapeColor = Math.floor(displayedLevel / 10) % 10;
  const shape = Math.floor(displayedLevel / 100) % 5;
  const badgeColor = Math.floor(displayedLevel / 500) % 10;

  return `<div ${additionalAttribs} title="${Math.floor(
    fraction * 100,
  )}% towards next level" class="leveltag ns lt_shape_${shape} lt_badge_color_${badgeColor} lt_shape_color_${shapeColor}">${displayedLevel}</div>`;
};

export class App extends LitElement {
  /**
   * @type {import('lit').PropertyDeclarations}
   */
  static properties = {
    data: {},
    connection: {},
    summoning: {},
    connectedCount: {},
    dismissible: {},
    width: {},
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.dismissible = null;
    const closeDismissible = () => {
      if (this.dismissible) {
        notify.dismiss(this.dismissible);
        this.dismissible = null;
      }
    };

    this.width = window.innerWidth;
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
    });

    /**
     * @type {null | true | import('../../types').StatusData}
     */
    this.data = null;
    /**
     * @type {import('../../types').StatusData[]}
     */
    this.dataHistory = [];
    /**
     * @type {import('socket.io-client').Socket}
     */
    this.connection = io("/", { transports: ["websocket"] });
    this.connection.on("connect", () => {
      console.log("connected");
      this.data = true;
      this.connectedCount++;
      if (this.connectedCount > 1) {
        history.go(0);
      }
    });

    this.connection.on("data", (data) => {
      this.dataHistory.push(data);

      this.processHistory();
      // @ts-ignore
      this.data = this.dataHistory.at(-1);
    });
    this.connection.on("history", (data) => {
      this.dataHistory = data;
      if (this.chart) {
        data.forEach((item) => {
          // @ts-ignore
          this.chart.data.datasets.forEach((dataset) => {
            dataset.data.push(
              item.server.main.active ? item.server.main.rooms : 0,
            );
          });
        });
      }

      this.data = data.at(-1);
    });

    this.connectedCount = 0;

    /**
     * @type {Chart | null}
     */
    this.chart = null;

    this.lastAddedID = -Infinity;
  }

  processHistory() {
    this.dataHistory = this.dataHistory
      .sort((a, b) => a.id - b.id)
      .filter((obj, index, arr) => {
        return arr.findIndex((item) => item.id === obj.id) === index;
      });
    if (this.dataHistory.length > 3600) {
      this.dataHistory = this.dataHistory.slice(this.dataHistory.length - 3600);
    }
  }

  renderChart() {
    if (!this.chart) {
      // @ts-ignore
      this.chart = new Chart(document.getElementById("chart-rooms"), {
        type: "line",
        data: {
          labels: this.dataHistory.map((item) => ""),
          datasets: [
            {
              label: "# of rooms",
              data: this.dataHistory.map((item) =>
                item.server.workers.reduce(
                  (a, b) => (b.active ? b.rooms + a : a),
                  0,
                ),
              ),
              borderWidth: 4,
            },
          ],
        },
        options: {
          elements: {
            point: {
              radius: 0,
            },
            line: {
              borderWidth: 10,
            },
          },
          scales: {
            y: {
              suggestedMax: 5,
              ticks: {
                stepSize: 1,
                beginAtZero: true,
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                },
              },
              min: 0,
            },
            x: {
              ticks: {
                stepSize: 100,
                beginAtZero: true,
                padding: 0,
                maxTicksLimit: 0,
              },
            },
          },
        },
      });

      // @ts-ignore
      this.lastAddedID = this.dataHistory.at(-1).id;
    } else {
      const items = this.dataHistory.filter(
        (item) => item.id > this.lastAddedID,
      );
      // @ts-ignore
      this.lastAddedID = this.dataHistory.at(-1).id;
      this.chart.data.datasets.forEach((dataset) =>
        dataset.data.push(
          ...items.map((item) =>
            item.server.workers.reduce(
              (a, b) => (b.active ? b.rooms + a : a),
              0,
            ),
          ),
        ),
      );
      // @ts-ignore
      this.chart.data.labels.push(...items.map((item) => ""));
      this.chart.update();
    }
  }

  render() {
    if (!this.data) return html`<p>Connecting...</p>`;
    else if (this.data === true) return html`Waiting for data...`;
    setTimeout(() => {
      if (
        document.getElementById("chart-rooms") &&
        this.dataHistory.length > 0
      ) {
        this.renderChart();
      }
    }, 1);
    return html`
      <div class="flex mx-10 gap-10 mt-10 text-white items-start">
        <div
          class="p-4 flex-grow-[2] bg-${this.data.server.main.active
            ? "green"
            : "red"}-400 flex flex-col"
        >
          <div class="text-3xl text-center underline">Server Status</div>
          <div class="text-xl">
            Server is ${this.data.server.main.active ? "up" : "down"}
            ${this.data.server.main.active
              ? html`and controller session is
                ${this.data.server.main.connected
                  ? "connected"
                  : "not connected"}`
              : ""}
          </div>
          ${true
            ? html`<div>
                Currently in
                <strong
                  >${this.data.server.workers.reduce(
                    (a, b) => (b.active ? b.rooms + a : a),
                    0,
                  )}</strong
                >
                rooms
                <br /><br />
                Workers:
                <div class="flex">
                  ${this.data.server.workers.map(
                    (worker) => html`
                      <div
                        class="flex-grow p-3 border-black border-2 bg-${worker.active
                          ? "blue"
                          : "red"}-400 text-center"
                      >
                        ${worker.id}
                        ${worker.active ? ` - ${worker.rooms}` : ""}
                      </div>
                    `,
                  )}
                </div>
                <br />
                <canvas id="chart-rooms"></canvas>
              </div>`
            : ""}
        </div>
        <div
          class="p-4 flex-grow-[1] bg-${this.data.account.active
            ? "blue"
            : "red"}-400 flex flex-col w-[${(this.width - 40 * 3) / 3}px]"
        >
          <div class="text-3xl text-center underline">Account Status</div>
          ${this.data.account.active
            ? html`<div class="text-xl">Play stats:</div>
                <div class="text-lg">
                  <strong>
                    ${Math.floor(this.data.account.playtime / 3600)}
                  </strong>
                  hours
                  <strong>
                    ${Math.floor((this.data.account.playtime % 3600) / 60)}
                  </strong>
                  minutes
                  <strong>
                    ${Math.floor(this.data.account.playtime % 60)} </strong
                  >seconds played
                </div>
                <div>
                  <strong> ${this.data.account.gamesWon} </strong>
                  /
                  <strong> ${this.data.account.gamesPlayed} </strong>
                  games won
                </div>
                <div>
                  Level:
                  ${unsafeHTML(renderLevelNumber(this.data.account.level))}
                  <span class="mx-1"></span>
                  <strong>
                    ${Math.floor(this.data.account.xp).toLocaleString("en-US")}
                  </strong>
                  XP
                </div>`
            : html`<div class="text-2xl text-center">
                Bot is currently <strong>banned</strong>.
                <div class="text-lg">
                  We are working to fix the problem as soon as possible.
                </div>
              </div>`}
        </div>
      </div>
    `;
  }
}
customElements.define("my-app", App);
