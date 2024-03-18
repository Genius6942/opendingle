import { LitElement, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html";

class App extends LitElement {
  static properties = {
    data: {},
  };

  constructor() {
    super();

    /**
     * @type {null | {q: string; a: string}[]}
     */
    this.data = null;

    fetch("/data/faq.json")
      .then((r) => r.json())
      .then((r) => (this.data = r))
      .catch((e) => alert("error loading faq:", e));
  }
  createRenderRoot() {
    return this;
  }

  render() {
    return html` <div class="p-14 flex flex-col gap-10">
      ${!this.data
        ? "Loading..."
        : this.data.map(
            (item) =>
              html`<div class="text-xl">
                <strong class="text-4xl">Q: ${item.q}</strong><br />
                <br />
                A: ${unsafeHTML(item.a)}
              </div>`,
          )}
    </div>`;
  }
}

customElements.define("my-app", App);
