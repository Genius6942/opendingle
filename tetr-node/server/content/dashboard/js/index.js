import { LitElement, html } from "lit";
import { io } from "socket.io-client";
import { Notyf } from "notyf";

/**
 * @type {Notyf}
 */
const notify = new Notyf();

/**
 *
 * @param {import("../../../types").RoomData} room
 * @param {(room: import("../../../types").RoomData) => void} summon
 * @param {boolean} summoning
 * @returns
 */
const roomTemplate = (room, summon, summoning, shrink = false) => html`<a
            href="https://tetr.io/#${room.id}"
            target="_blank"
            class="chunk-set flex mx-3 my-2"
          >
            <div class="chunk text-3xl font-bold ">${room.id}</div>
						<div class="chunk w-40 overflow-hidden relative flex-col items-start">
							<i class="font-xl whitespace-nowrap text-ellipsis overflow-hidden block w-full" title="${
                room.name
              }">${room.name}</i>
							<div class="flex items-end">
								<strong><code class="mr-3">${room.type}</code></strong>
								<div class="mr-2 whitespace-nowrap">${
                  room.state === "ingame" ? "IN GAME" : "LOBBY"
                }</div>
							</div>
						</div>
						<div class="chunk flex">
							<strong class="mx-1">${room.count}</strong>
							${
                !shrink
                  ? html`<span class="mr-[-0px]"
                      >${room.players === 1 ? "player" : "players"}</span
                    >`
                  : ""
              }
							${
                room.players !== room.count
                  ? !shrink
                    ? html`:
                        <strong class="mx-1">${room.players}</strong> playing +
                        <strong class="mx-1"
                          >${room.count - room.players}</strong
                        >
                        spectating`
                    : html`:
                        <strong class="mx-1"
                          >${room.players} +
                          ${room.count - room.players}</strong
                        >`
                  : ""
              }
						</div>
						<div class="chunk flex-grow justify-end group">
							${
                summoning
                  ? html`<svg
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>`
                  : !room.botInRoom
                    ? html`<button
                        class="mx-2 w-[24px] overflow-hidden whitespace-nowrap group-hover:w-[90px] transition-all duration-300 inline-flex align-middle"
                        type="button"
                        @click="${(e) => {
                          e.preventDefault();
                          summon(room);
                        }}"
                      >
                        <span class="icon fa-xl mr-2">smart_toy</span>Summon
                      </button>`
                    : html`<span class="icon">check</span>` || null
              }
						</div>
          </a>
					</a>`;

export class App extends LitElement {
  static properties = {
    rooms: {},
    connection: {},
    summoning: [],
    connectedCount: 0,
    dismissible: {},
    width: 0,
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
     * @type {null | true | import('../../../types').RoomData[]}
     */
    this.rooms = null;
    /**
     * @type {import('socket.io-client').Socket}
     */
    this.connection = io("/", { transports: ["websocket"] });
    this.connection.on("connect", () => {
      console.log("connected");
      this.rooms = true;
      this.connectedCount++;
      if (this.connectedCount > 1) {
        history.go(0);
      }
    });

    this.connectedCount = 0;
    this.connection.on(
      "publicRooms",
      /**
       * @param {import('../../../types').RoomData[]} rooms
       */
      (rooms) => {
        this.rooms = rooms;
        [...this.rooms].reverse().forEach((room) => {
          if (this.summoning.includes(room.id)) {
            this.summoning.splice(this.summoning.indexOf(room.id), 1);
          }
        });
      },
    );

    this.connection.on("error", (err) => {
      notify.error({
        message: err,
        duration: 3000,
        dismissible: true,
      });
      closeDismissible();
    });

    this.connection.on("created", (roomId) => {
      notify.success({
        message: `Created room ${roomId}. Join at <a href="https://tetr.io/#${roomId}" target="_blank" style="display: inline-flex; vertical-align: middle;">https://tetr.io/#${roomId}<span class="icon ml-2">open_in_new</span></a>`,
        duration: 0,
        dismissible: true,
      });
      closeDismissible();
    });

    this.connection.on("joined", (roomId) => {
      notify.success({
        message: `Joined room ${roomId}. Join at <a href="https://tetr.io/#${roomId}" target="_blank" style="display: inline-flex; vertical-align: middle;">https://tetr.io/#${roomId}<span class="icon ml-2">open_in_new</span></a>`,
        duration: 3000,
        dismissible: true,
      });
      closeDismissible();
    });

    /**
     * @type {string[]}
     */
    this.summoning = [];

    fetch("/auth")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  /**
   * @param {import("../../../types").RoomData} room
   */
  summon(room) {
    this.connection.emit("summon", room.id);
    this.rooms[this.rooms.indexOf(room)].botInRoom = true;
    this.summoning = [...this.summoning, room.id];
  }

  render() {
    if (!this.rooms) return html`<p>Connecting...</p>`;
    else if (this.rooms === true) return html`Waiting for room data...`;
    return html`
      <div class="flex items-end mt-3">
        <div class="flex-grow px-2 mx-5">
          Create room:
          <form
            class="flex items-center"
            @submit="${(e) => {
              e.preventDefault();
              if (this.dismissible) {
                return notify.error("Please wait, only 1 action at a time.");
              }
              this.connection.emit(
                "create",
                e.target.type.value === "public",
                e.target.code.value,
              );

              this.dismissible = notify.open({
                message: "Creating room...",
                duration: 0,
                dismissible: false,
                className: "bg-slate-400",
                icon: {
                  color: "white",
                  tagName: "span",
                  className: "icon fa-spin",
                  text: "autorenew",
                },
              });
            }}"
          >
            <input
              type="text"
              name="code"
              placeholder="Custom room code (blank for random)"
              class="flex-grow mr-2 px-2 py-1 outline-none border-dashed border-2 border-black rounded-xl focus-within:border-solid"
            />
            <select
              name="type"
              class="mr-2  bg-black rounded-xl px-2 py-1 border-solid"
            >
              <option
                value="private"
                selected
                class="border-[1px] border-black appearance-none"
              >
                Private
              </option>
              <option value="public" class="appearance-none">Public</option>
            </select>
            <input
              type="submit"
              value="Create"
              class="relative border-black border-2 rounded-xl p-2 px-3 cursor-pointer transition-colors hover:bg-slate-200 focus:bg-slate-200 duration-300"
            />
          </form>
        </div>
        <div class="px-2 flex-grow">
          Summon bot to room:
          <form
            class="flex items-center"
            @submit="${(e) => {
              e.preventDefault();
              if (this.dismissible) {
                return notify.error("Please wait, only 1 action at a time.");
              }
              this.connection.emit("summon", e.target.code.value);
              this.dismissible = notify.open({
                message: "Joining room...",
                duration: 0,
                dismissible: false,
                className: "bg-slate-400",
                icon: {
                  color: "white",
                  tagName: "span",
                  className: "icon fa-spin",
                  text: "autorenew",
                },
              });
            }}"
          >
            <input
              type="text"
              name="code"
              placeholder="Room code"
              required
              class="flex-grow mr-2 px-2 py-1 outline-none border-dashed border-2 border-black rounded-xl focus-within:border-solid"
            />
            <input
              class="relative border-black border-2 rounded-xl p-2 px-3 cursor-pointer transition-colors hover:bg-slate-200 duration-300"
              type="submit"
              value="Summon"
            />
          </form>
        </div>
      </div>
      <div class="mx-10 bg-black rounded-full h-1 mt-3"></div>
      <div class="flex">
        <div class="flex-1">
          <div class="text-5xl text-center">Public Rooms</div>
          ${this.rooms.map((room) =>
            roomTemplate(
              room,
              this.summon.bind(this),
              this.summoning.includes(room.id),
              this.width < 1200,
            ),
          )}
        </div>
        <div class="flex-1">
          <div class="text-5xl text-center">My Rooms</div>
        </div>
      </div>
    `;
  }
}
customElements.define("my-app", App);
