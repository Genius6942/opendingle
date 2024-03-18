import { LitElement, html } from "lit";
import dayjs from "dayjs";
import { editor, languages } from "monaco-editor";
dayjs.extend(dayjs_plugin_customParseFormat);

function extendDefaults() {
  for (let i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue;
    }
    for (const key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }
  return arguments[0];
}

const typeCustomTokenizer = [
  {
    name: "orange-alert",
    regex: "橙色告警",
    style: { foreground: "#FFA500", fontStyle: "bold" },
  },
  {
    name: "red-alert",
    regex: "红色告警",
    style: { foreground: "#FF0000", fontStyle: "bold" },
  },
];

languages.register({ id: "log" });

const logCustomRules = [];
const themeRules = [];
for (let i = 0; i < typeCustomTokenizer.length; i++) {
  try {
    logCustomRules.push([
      new RegExp(typeCustomTokenizer[i].regex),
      typeCustomTokenizer[i].name,
    ]);
    themeRules.push(
      extendDefaults(
        { token: typeCustomTokenizer[i].name + ".log" },
        typeCustomTokenizer[i].style,
      ),
    );
  } catch (e) {
    console.error("error", e);
  }
}

languages.setMonarchTokensProvider("log", {
  defaultToken: "",
  tokenPostfix: ".log",
  tokenizer: {
    root: [
      // Custom rules
      ...logCustomRules,
      // Trace/Verbose
      [/\b(Trace)\b:/, "verbose"],
      // Serilog VERBOSE
      [/\[(verbose|verb|vrb|vb|v)\]/i, "verbose"],
      // Android logcat Verboce
      [/\bV\//, "verbose"],
      // DEBUG
      [/\b(DEBUG|Debug)\b|\b([dD][eE][bB][uU][gG])\:/, "debug"],
      // Serilog DEBUG
      [/\[(debug|dbug|dbg|de|d)\]/i, "debug"],
      // Android logcat Debug
      [/\bD\//, "debug"],
      // INFO
      [
        /\b(HINT|INFO|INFORMATION|Info|NOTICE|II)\b|\b([iI][nN][fF][oO]|[iI][nN][fF][oO][rR][mM][aA][tT][iI][oO][nN])\:/,
        "info",
      ],
      // serilog INFO
      [/\[(information|info|inf|in|i)\]/i, "info"],
      // Android logcat Info
      [/\bI\//, "info"],
      // WARN
      [
        /\b(WARNING|WARN|Warn|WW)\b|\b([wW][aA][rR][nN][iI][nN][gG])\:/,
        "warning",
      ],
      // Serilog WARN
      [/\[(warning|warn|wrn|wn|w)\]/i, "warning"],
      // Android logcat Warning
      [/\bW\//, "warning"],
      // ERROR
      [
        /\b(ALERT|CRITICAL|EMERGENCY|ERROR|FAILURE|FAIL|Fatal|FATAL|Error|EE)\b|\b([eE][rR][rR][oO][rR])\:/,
        "error",
      ],
      // Serilog ERROR
      [/\[(error|eror|err|er|e|fatal|fatl|ftl|fa|f)\]/i, "error"],
      // Android logcat Error
      [/\bE\//, "error"],
      // ISO dates ("2020-01-01")
      [/\b\d{4}-\d{2}-\d{2}(T|\b)/, "date"],
      // Culture specific dates ("01/01/2020", "01.01.2020")
      [/\b\d{2}[^\w\s]\d{2}[^\w\s]\d{4}\b/, "date"],
      // Clock times with optional timezone ("01:01:01", "01:01:01.001", "01:01:01+01:01")
      [/\d{1,2}:\d{2}(:\d{2}([.,]\d{1,})?)?(Z| ?[+-]\d{1,2}:\d{2})?\b/, "date"],
      // Git commit hashes of length 40, 10, or 7
      [/\b([0-9a-fA-F]{40}|[0-9a-fA-F]{10}|[0-9a-fA-F]{7})\b/, "constant"],
      // Guids
      [/[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}/, "constant"],
      // Constants
      [/\b([0-9]+|true|false|null)\b/, "constant"],
      // String constants
      [/"[^"]*"/, "string"],
      [/(?<![\w])'[^']*'/, "string"],
      // Exception type names
      [/\b([a-zA-Z.]*Exception)\b/, "exceptiontype"],
      // Colorize rows of exception call stacks
      [/^[\t ]*at.*$/, "exception"],
      // Match Urls
      [/\b(http|https|ftp|file):\/\/\S+\b\/?/, "constant"],
      // Match character and . sequences (such as namespaces) as well as file names and extensions (e.g. bar.txt)
      [/(?<![\w/\\])([\w-]+\.)+([\w-])+(?![\w/\\])/, "constant"],
    ],
  },
});

editor.defineTheme("logview", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "info.log", foreground: "#4b71ca" },
    { token: "error.log", foreground: "#ff0000", fontStyle: "bold" },
    { token: "warning.log", foreground: "#FFA500" },
    { token: "date.log", foreground: "#008800" },
    { token: "exceptiontype.log", foreground: "#808080" },
    ...themeRules,
  ],
  colors: {
    "editor.lineHighlightBackground": "#ffffff",
    "editorGutter.background": "#f7f7f7",
  },
});

/**
 * JSON formats the json parts of log file
 * @param {string} str
 * @returns
 */
const jsonExpandLog = (str) => {
  return str.split("\n").map((b) => {
    const start = b.startsWith("[send]:") ? "[send]:" : "[recieve]:";
    try {
      return (
        start +
        " " +
        JSON.stringify(JSON.parse(b.slice(start.length, b.length)), null, 2)
      );
    } catch {
      return b;
    }
  });
};

class App extends LitElement {
  static properties = {
    logFiles: [],
    selectedLogFile: {
      name: null,
      content: null,
    },
    maxLogsVisible: 8,
    wordWrap: false,
    jsonExpand: false,
    ogLogContent: "",
  };

  constructor() {
    super();
    this.wordWrap = false;
    this.jsonExpand = false;

    (async () => {
      this.logFiles = await fetch("/locallogs/all")
        .then((res) => res.json())
        .catch((e) => (this.logFiles = "Failed to fetch logs: " + e));
      this.logFiles.forEach((file) => console.log(file));
    })();

    this.maxLogsVisible = 8;

    this.logContent = "Select a log to view";

    this.ogLogContent = "Select a log to view";
  }

  set logContent(value) {
    if (!this.editor) return value;
    this.editor.setValue(value);
    return value;
  }
  get wordWrapState() {
    return this.wordWrap ? "on" : "off";
  }

  get jsonExpandState() {
    return this.jsonExpand ? "on" : "off";
  }

  get logContent() {
    return this.editor ? this.editor.getValue() : undefined;
  }

  updateEditor() {
    if (this.jsonExpand) {
      this.logContent = jsonExpandLog(this.ogLogContent);
    } else {
      this.logContent = this.ogLogContent;
    }
    this.editor.updateOptions({ wordWrap: this.wordWrapState });
  }

  createEditor() {
    this.editor = editor.create(document.getElementById("editor"), {
      value: this.logContent || "",
      language: "log",
      automaticLayout: true,
      readOnly: true,
      theme: "hc-black",
      wordWrap: this.wordWrapState,
    });

    this.updateEditor();

    // languages.json.jsonDefaults.setDiagnosticsOptions({
    //   schemaValidation: "ignore",
    //   validate: false,
    // });

    this.logContent = "Select a log to view content";
  }

  createRenderRoot() {
    return this;
  }

  async loadLog(id) {
    console.log("load log", id);
    this.logContent = "Loading " + id + "...";
    this.logContent = await fetch("/locallogs/file?id=" + id)
      .then((r) => r.json())
      .then((r) => Promise.resolve(r.content))
      .catch((e) => (this.logContent = "Failed to fetch " + id + ": " + e));
    this.ogLogContent = this.logContent;
    return this.logContent;
  }

  render() {
    if (!this.editor && document.getElementById("editor")) this.createEditor();
    return html`
      <div>
        <div class="text-center mt-3 text-3xl">Logs</div>
        <div class="m-5 chunk-set flex flex-wrap justify-center">
          ${this.logFiles
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
                  .slice(0, Math.min(this.maxLogsVisible, this.logFiles.length))
                  .map(
                    (file) =>
                      html`<div
                        @click="${() => this.loadLog(file._id)}"
                        class="chunk cursor-pointer top-0 hover:top-2 hover:brightness-110"
                      >
                        <div class="p-3 text-xl">
                          ${file.dayjsTimestamp.format("M-D-YYYY H-m-s")}
                        </div>
                      </div>`,
                  )
              : this.logFiles
            : "Loading..."}
        </div>
        <div class="flex items-center mt-4 flex-col">
          ${(this.logFiles &&
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
          null}
          <div class="mt-3 w-11/12 h-[1px] bg-slate-500"></div>
          <div class="flex gap-3">
            <button
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
            </button>
          </div>
          <div id="editor" class="w-5/6 h-[600px] mt-5"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("my-app", App);
