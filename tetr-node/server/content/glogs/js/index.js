import { LitElement, html } from "lit";
import dayjs from "dayjs";
dayjs.extend(dayjs_plugin_customParseFormat);
const blockWidth = 25;
const boardHeight = 24;

class App extends LitElement {
  static properties = {
    logFiles: [],
    selectedLogFile: {
      name: null,
      content: null,
    },
    maxLogsVisible: 8,
    rerenderKey: 0,
  };

  constructor() {
    super();

    (async () => {
      this.logFiles = await fetch("/glogs/all")
        .then((res) => res.json())
        .catch((e) => (this.logFiles = "Failed to fetch logs: " + e));
      this.logFiles.forEach((file) => console.log(file));
    })();

    this.maxLogsVisible = 8;

    this.selectedLogFile = {
      name: null,
      content: null,
      frameIndex: 0,
    };

    this.rerenderKey = 0;
  }

  createRenderRoot() {
    return this;
  }

  async loadLog(id) {
    console.log("load log", id);
    location.href = "/glogs/" + id;
    return;
    console.log("load log", id);
    this.selectedLogFile.content = "Loading " + id + "...";
    this.selectedLogFile.content = await fetch("/glogs/file?id=" + id)
      .then((r) => r.json())
      .catch(
        (e) =>
          (this.selectedLogFile.content = "Failed to fetch " + id + ": " + e),
      );

    this.rerenderKey++;
    this.selectedLogFile.frameIndex = 0;
    return this.selectedLogFile.content;
  }

  renderCanvas() {
    if (
      !this.selectedLogFile.content ||
      typeof this.selectedLogFile.content !== "object"
    ) {
      return;
    }

    document.getElementById("slider").value = this.selectedLogFile.frameIndex;

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const colorMap = {
      T: "purple",
      I: "cyan",
      G: "grey",
      O: "yellow",
      J: "blue",
      L: "orange",
      S: "green",
      Z: "red",
    };

    const w = canvas.width,
      h = canvas.height;
    const renderState = Math.max(
      0,
      Math.min(
        this.selectedLogFile.frameIndex,
        this.selectedLogFile.content.states.length,
      ),
    );

    const state = this.selectedLogFile.content.states[renderState].state
      .filter((arr) => arr.filter((a) => a).length > 0)
      .reverse();
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < state.length; y++) {
      for (let x = 0; x < state[y].length; x++) {
        if (!state[y][x]) continue;
        ctx.fillStyle = colorMap[state[y][x].toUpperCase()];
        ctx.fillRect(
          w / 2 - (state[0].length * blockWidth) / 2 + blockWidth * x,
          h - blockWidth * (y + 1),
          blockWidth,
          blockWidth,
        );
      }
    }
    const boardSideMargin = 8;
    ctx.fillStyle = "white";
    ctx.fillRect(
      canvas.width / 2 + (blockWidth * state[0].length) / 2,
      0,
      boardSideMargin,
      canvas.height,
    );
    ctx.fillRect(
      -canvas.width / 2 - (blockWidth * state[0].length) / 2 - boardSideMargin,
      0,
      boardSideMargin,
      canvas.height,
    );

    const garbage = this.selectedLogFile.content.states[renderState].garbage;
    const garbageWidth = 10;
    if (garbage.length >= 1) {
      const initiatedGarbage = garbage
        .filter((a) => a.initiated)
        .reduce((a, b) => a + b.amount, 0);
      const uninitiatedGarbage = garbage
        .filter((a) => !a.initiated)
        .reduce((a, b) => a + b.amount, 0);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(
        w / 2 -
          (state[0].length * blockWidth) / 2 -
          garbageWidth -
          boardSideMargin,
        h - initiatedGarbage * blockWidth,
        garbageWidth,
        initiatedGarbage * blockWidth,
      );
      ctx.fillStyle = "#bb0000";
      ctx.fillRect(
        w / 2 -
          (state[0].length * blockWidth) / 2 -
          garbageWidth -
          boardSideMargin,
        h - uninitiatedGarbage * blockWidth - initiatedGarbage * blockWidth,
        garbageWidth,
        uninitiatedGarbage * blockWidth,
      );
    }
  }

  render() {
    setTimeout(this.renderCanvas.bind(this), 5);
    return html`
      <div>
        <div class="text-center mt-3 text-3xl">Logs</div>
        <div class="m-5 chunk-set flex flex-wrap justify-center">
          ${
            this.logFiles
              ? this.logFiles instanceof Array
                ? this.logFiles
                    .map((a) => ({
                      ...a,
                      dayjsTimestamp: dayjs(a.timestamp),
                    }))
                    // .sort((a, b) => {
                    //   console.log(a, b);
                    //   return a.dayjsTimestamp.isBefore(b.dayjsTimestamp)
                    //     ? -1
                    //     : a.dayjsTimestamp.isAfter(b.dayjsTimestamp)
                    //     ? 1
                    //     : 0;
                    // })
                    .reverse()
                    // .filter((a) => !a.name.startsWith("M"))
                    .slice(
                      0,
                      Math.min(this.maxLogsVisible, this.logFiles.length),
                    )
                    .map(
                      (file) =>
                        html`<div
                          @click="${() => this.loadLog(file._id)}"
                          class="chunk cursor-pointer top-0 hover:top-2 hover:brightness-110"
                        >
                          <div class="p-3 text-xl">
                            ${file.dayjsTimestamp.format("M-D-YYYY H-m-s")} vs
                            ${file.players[0]}
                            ${file.players.length > 1
                              ? "+" + (file.players.length - 1).toString()
                              : ""}
                            round ${file.round} ${file.flagged ? "FLAGGED" : ""}
                          </div>
                        </div>`,
                    )
                : this.logFiles
              : "Loading..."
          }
        </div>
        <div class="flex items-center mt-4 flex-col">
          ${
            (this.logFiles &&
              this.logFiles.length > this.maxLogsVisible &&
              html` <button
                class="hover:mt-1 hover:brightness-110 bg-[#3b2535] px-5 py-1"
                style="clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%)"
                @click="${() => {
                  this.maxLogsVisible += 4;
                }}"
              >
                Show more
              </button>`) ||
            null
          }
          <div class="mt-3 w-11/12 h-[1px] bg-slate-500"></div>
          <div class="flex gap-3 items-center mt-3">
             <!-- <button
              class="bg-[#3b2535] p-3 px-5 mt-3"
              style="clip-path: polygon(15% 0, 85% 0, 100% 50%, 100% 50%, 85% 100%, 15% 100%, 0 50%, 0 50%)"
              @click="${() => {
                this.wordWrap = !this.wordWrap;
                this.updateEditor();
              }}"
            >
              Toggle word wrap (${this.wordWrapState})
            </button>
            <button
              class="bg-[#3b2535] p-3 px-5 mt-3"
              style="clip-path: polygon(15% 0, 85% 0, 100% 50%, 100% 50%, 85% 100%, 15% 100%, 0 50%, 0 50%)"
              @click="${() => {
                this.jsonExpand = !this.jsonExpand;
                this.updateEditor();
              }}"
            >
              Toggle expanded json (${this.jsonExpandState})
            </button> -->
            ${
              this.selectedLogFile.content &&
              this.selectedLogFile.content.states &&
              this.selectedLogFile.content.states.length
                ? html` <button
                      class="bg-[#5f3754] p-3"
                      style="clip-path: polygon(0 50%, 100% 0, 100% 100% )"
                      @click="${() => {
                        this.selectedLogFile.frameIndex = Math.max(
                          this.selectedLogFile.frameIndex - 1,
                          0,
                        );
                        this.rerenderKey++;
                      }}"
                    ></button>
                    <div class="mx-3 text-white">
                      ${this.selectedLogFile.frameIndex + 1}/${this
                        .selectedLogFile.content.states.length}
                    </div>
                    <button
                      class="bg-[#5f3754] p-3"
                      style="clip-path: polygon(0 0, 100% 50%, 0 100%)"
                      @click="${() => {
                        this.selectedLogFile.frameIndex = Math.min(
                          this.selectedLogFile.frameIndex + 1,
                          this.selectedLogFile.content.states.length - 1,
                        );
                        this.rerenderKey++;
                      }}"
                    ></button>`
                : ""
            }
          </div>
          ${
            this.selectedLogFile.content &&
            this.selectedLogFile.content.states &&
            this.selectedLogFile.content.states.length
              ? html`<input
                    type="range"
                    id="slider"
                    min="0"
                    max="${this.selectedLogFile.content.states.length}"
                    id="range"
                    class="mt-3 w-96"
                    value="0"
                    @input="${(e) => {
                      this.selectedLogFile.frameIndex = parseInt(
                        e.target.value,
                      );
                      this.rerenderKey++;
                    }}"
                  />
                  <div>
                    ${this.selectedLogFile.content.states[
                      this.selectedLogFile.frameIndex
                    ].keys.join(", ")}
                    at frame
                    ${this.selectedLogFile.content.states[
                      this.selectedLogFile.frameIndex
                    ].frame}
                  </div>
                  <div>
                    ${this.selectedLogFile.content.states[
                      this.selectedLogFile.frameIndex
                    ].lines}
                    lines sent
                  </div>`
              : ""
          }
          
          <div id="view" class="w-5/6 mt-5">
            ${
              typeof this.selectedLogFile.content === "string"
                ? this.selectedLogFile.content
                : html`<canvas
                    width="${(window.innerWidth * 5) / 6}"
                    height="${blockWidth * boardHeight}"
                  ></canvas>`
            }
            </canvas>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("my-app", App);
