import { LitElement, html } from "lit";
import { Notyf } from "notyf";

const notify = new Notyf();

const ajax = async (url, data) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());

class App extends LitElement {
  static properties = {
    username: "",
  };
  constructor() {
    super();
    this.username = "";
  }
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex justify-center items-center mt-1">
        <div class="w-1/2">
          <div
            class="flex flex-col p-5 gap-4"
            style="background: linear-gradient(90deg, #3b2535, #563a4e); /* clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%); */"
          >
            <div class="text-3xl text-center text-white">
              Log in with TETR.IO
            </div>
            <form
              class="flex items-center flex-wrap gap-2"
              @submit="${async (e) => {
                e.preventDefault();
                if (this.username && this.username.length > 0) return;
                const username = e.target.username.value;
                if (!username || username.length === 0)
                  return notify.error("Please enter a username");
                const result = await ajax("/auth/startAuthentication", {
                  username,
                });
                if (result.success) {
                  this.username = username;
                  notify.success("Code sent to your TETR.IO account in a dm.");
                } else {
                  notify.error("An error occured: " + result.error);
                }
              }}"
            >
              Enter your TETR.IO username:
              <input
                type="text"
                name="username"
                class="ml-2 px-2 py-1 outline-none border-dashed border-2 border-black rounded-xl focus-within:border-solid"
              />
              <button
                class="ml-2 px-2 py-1 bg-black text-white rounded-xl flex items-center group transition-all pr-1 hover:pr-0"
                ?disabled="${this.username.length > 0}"
              >
                Send code
                <i class="icon transition-all group-hover:ml-1">arrow_right</i>
              </button>
            </form>
            ${this.username &&
            this.username.length > 0 &&
            html`<form
              class="flex items-center flex-wrap gap-2"
              @submit="${async (e) => {
                e.preventDefault();
                if (!this.username || this.username.length === 0)
                  return notify.error("Please enter a username");
                const token = e.target.token.value;
                if (!token || token.length === 0)
                  return notify.error("Please enter a code");
                const result = await ajax("/auth/verify", {
                  username: this.username,
                  token,
                });
                if (result.success) {
                  notify.success("Logged in!");
                  window.location.href = "/dashboard";
                } else {
                  notify.error("An error occured: " + result.error);
                }
              }}"
            >
              Enter your verification code:
              <input
                type="text"
                name="token"
                class="ml-2 px-2 py-1 outline-none border-dashed border-2 border-black rounded-xl focus-within:border-solid"
              />
              <button
                class="ml-2 px-2 py-1 bg-black text-white rounded-xl flex items-center group transition-all pr-1 hover:pr-0"
                ?disabled="${this.username.length === 0}"
              >
                Log in
                <i class="icon transition-all group-hover:ml-1">arrow_right</i>
              </button>
            </form>`}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("my-app", App);
