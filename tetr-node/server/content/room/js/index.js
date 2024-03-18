import { LitElement, html } from "lit";

class App extends LitElement {
  constructor() {
    super();
  }
  createRenderRoot() {
    return this;
  }
}

customElements.define("my-app", App);
