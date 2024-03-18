import { LitElement, html } from "lit";
import { io } from "socket.io-client";
import { Notyf } from "notyf";

/**
 * @type {Notyf}
 */
const notify = new Notyf();

export class App extends LitElement {
  static properties = {
    upvotes: {},
    user: {},
    foundUser: {},
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();

    /**
     * @type {null | true | [string, number][]}
     */
    this.upvotes = null;

    const loadedUser = localStorage.getItem("user");
    /**
     * @type {null | {name: string, pfp: string}}
     */
    this.user = loadedUser && loadedUser.length ? JSON.parse(loadedUser) : null;
    /**
     * @type {import('socket.io-client').Socket}
     */
    /**
     * @type {null | {name: string, pfp: string}}
     */
    this.foundUser = null;
    this.lastPoll = 0;

    this.getUser = async (name) => {
      try {
        const l = this.lastPoll;
        this.lastPoll = performance.now();
        await new Promise((resolve) =>
          setTimeout(resolve, performance.now() - l > 1000 ? 0 : 1000)
        );
        const res = await fetch(
          `https://corsproxy.io?https://ch.tetr.io/api/users/${name}`
        );
        const data = await res.json();
        if (!data.success) {
          if (name.toLowerCase() === name) {
            this.foundUser = null;
          } else {
            this.getUser(name.toLowerCase());
          }
          return;
        }
        const user = {
          name: data.data.user.username,
          pfp: `https://tetr.io/user-content/avatars/${data.data.user._id}.jpg?rv=${data.data.user.avatar_revision}`,
        };

        this.foundUser = user;
      } catch (err) {
        console.error(err);
        this.foundUser = null;
      }
    };
    this.getUser = this.getUser.bind(this);
    this.connection = io("/", { transports: ["websocket"] });
    this.connection.on("connect", () => {
      console.log("connected");
      this.upvotes = true;
      this.connectedCount++;
      if (this.connectedCount > 1) {
        history.go(0);
      }
    });

    this.connectedCount = 0;
    this.connection.on("upvotes", (upvotes) => {
      this.upvotes = upvotes;
    });

    this.connection.on("upvote", ({ name, pfp }) => {
      if (!this.upvotes || this.upvotes === true) return;
      if (this.upvotes.find(([n]) => n === name)) {
        this.upvotes = this.upvotes.map(([n, p]) => [
          n,
          n === name ? p + 1 : p,
        ]);
      } else {
        this.upvotes = [...this.upvotes, [name, 1]];
      }

      pfp = pfp.includes("undefined") ? "https://tetr.io/res/avatar.png" : pfp;

      const x = window.innerWidth * Math.random(),
        y = window.innerHeight * Math.random();
      const div = document.createElement("div");
      div.className = "float text-black dark:text-white font-bold text-xl";
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      const img = document.createElement("img");
      img.src = pfp;
      img.className = "rounded-full h-8 w-8";
      div.appendChild(img);
      div.innerText += ` ${name} +1`;
      img.onload = () => {
        document.body.appendChild(div);
        setTimeout(() => {
          div.remove();
        }, 1000);
      };
    });

    this.connection.on("error", (err) => {
      notify.error({
        message: err,
        duration: 3000,
        dismissible: true,
      });
    });
  }

  render() {
    if (!this.upvotes) return html`<p>Connecting...</p>`;
    else if (this.upvotes === true) return html`Waiting for data...`;
    if (!this.user)
      return html`<div
        class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
      >
        <div class="flex gap-3">
          <input
            class="border-2 border-gray-300 rounded-md p-2 w-72"
            placeholder="TETR.IO Username"
            @input=${(e) => {
              this.getUser(e.target.value);
            }}
          />
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-500"
            @click=${() => {
              this.user = this.foundUser;
              localStorage.setItem("user", JSON.stringify(this.user));
            }}
            ${!this.foundUser ? "disabled" : ""}
          >
            Join
          </button>
        </div>
        <div class="flex gap-3 items-center dark:text-white text-2xl mt-4">
          ${this.foundUser
            ? html`<img
                class="rounded-full h-8 w-8"
                src=${this.foundUser.pfp}
                alt="Profile picture"
              />`
            : ""}
          ${this.foundUser ? html`<p>${this.foundUser.name}</p>` : ""}
        </div>
      </div>`;
    return html` <div
      class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <button
        @click=${({ target }) => {
          this.connection.emit("upvote", {
            name: this.user.name,
            pfp: this.user.pfp,
          });
          target.classList.remove("shake");
          setTimeout(() => target.classList.add("shake"), 0);
        }}
        class="text-9xl hover:scale-105 scale-100 transition-all"
      >
        👍
      </button>
      <div class="flex gap-3 items-center dark:text-white text-2xl mt-4">
        ${this.upvotes.map((item) => item[1]).reduce((a, b) => a + b, 0)}
        Upvotes from ${this.upvotes.length} users
      </div>
    </div>`;
  }
}
customElements.define("my-app", App);
