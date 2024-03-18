export type ListenerInput = {
  reply: (message: string) => void;
  args: string[];
  user: { id: string; name: string; host: boolean };
};

export type Listener = {
  command: string;
  restricted: boolean;
  listener: (input: ListenerInput) => void;
};

export type RestrictionLevel = "off" | "host" | "admin" | "owner";
export const restrictionLevels: RestrictionLevel[] = [
  "off",
  "host",
  "admin",
  "owner",
];

export class Commands {
  prefix: string;
  listeners: Listener[];
  replyPrefix: string;
  restriction: RestrictionLevel = "off";
  constructor(prefix = ">", replyPrefx = "<") {
    this.prefix = prefix;
    this.replyPrefix = replyPrefx;

    this.listeners = [];
  }

  on(commands: string[], listener: Listener["listener"], restricted = false) {
    commands.forEach((command) =>
      this.listeners.push({ command, listener, restricted }),
    );
  }

  off(command: string, listener: Listener["listener"]) {
    this.listeners = this.listeners.filter(
      (l) => l.command !== command && l.listener !== listener,
    );
  }

  once(commands: string[], listener: Listener["listener"], restricted = false) {
    const onceListener = (input: ListenerInput) => {
      listener(input);
      commands.forEach((command) => this.off(command, onceListener));
    };
    this.on(commands, onceListener, restricted);
  }

  applyMessage(
    user: { id: string; name: string; level: RestrictionLevel; host: boolean },
    message: string,
    sendMessage: (message: string) => void,
  ) {
    if (!message.startsWith(this.prefix)) return;
    message = message.slice(this.prefix.length);
    const args = message.split(" ");
    const command = args.shift();
    if (!command) return;
    this.listeners
      .filter((l) => l.command === command)
      .forEach((l) => {
        if (
          l.restricted &&
          restrictionLevels.indexOf(user.level) <
            restrictionLevels.indexOf(this.restriction)
        )
          return sendMessage(
            this.replyPrefix +
              "Bot in restricted mode. You can not run this command.",
          );
        l.listener({
          reply: (message: string) => sendMessage(this.replyPrefix + message),
          args,
          user,
        });
      });
    if (this.listeners.filter((l) => l.command === command).length === 0) {
      sendMessage("[Dingle Bot] Unknown command: " + command);
    }
  }

  restrict(level: RestrictionLevel) {
    this.restriction = level;
  }
}
