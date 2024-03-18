import path from "path";
import * as fs from "fs";

function insertTextAtLine(
  filePath: string,
  line: number,
  textToInsert: string
): void {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  if (line > lines.length) {
    lines.push(textToInsert);
  }

  lines.splice(line, 0, textToInsert);

  const updatedContent = lines.join("\n");
  fs.writeFileSync(filePath, updatedContent);
}

export class Logger {
  static path = path.join(process.cwd(), "log.txt");

  path: string;
  listeners: ((newContent: string) => void)[];
  lines: number;
  constructor(path = Logger.path) {
    this.path = path;

    this.listeners = [];
    this.lines = 0;

    this.clearLog();
    this.write(
      "------ Start of logs for " + new Date().toDateString() + " ------"
    );
  }

  clearLog() {
    fs.writeFileSync(this.path, "");
  }

  private write(content: string) {
    insertTextAtLine(this.path, this.lines, content);
    this.lines += content.split("\n").length;
  }

  log(...args: any) {
    console.log(...args);
    const textContent = args
      .map((arg) => {
        if (typeof arg === "string") return arg;
        else if (
          typeof arg === "number" ||
          typeof arg === "bigint" ||
          typeof arg === "boolean" ||
          typeof arg === "function" ||
          typeof arg === "symbol"
        )
          return arg.toString();
        else if (typeof arg === "undefined") return "undefined";
        else {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return arg.toString();
          }
        }
      })
      .join(" ");
    this.write(textContent);
    this.listeners.forEach((listener) => listener(textContent));
  }

  get content() {
    return fs.readFileSync(this.path);
  }

  listen(callback: (typeof this.listeners)[0]) {
    this.listeners.push(callback);
  }

  unlisten(callback: (typeof this.listeners)[0]) {
    this.listeners = this.listeners.filter((listener) => listener === callback);
  }
}

const logger = new Logger();

const log = logger.log.bind(logger) as typeof logger.log,
  listen = logger.listen.bind(logger) as typeof logger.listen,
  unlisten = logger.unlisten.bind(logger) as typeof logger.unlisten;

export { logger, log, listen, unlisten };
