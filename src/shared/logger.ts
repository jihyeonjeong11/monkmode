import { MonkModeError } from "./errors";

type Context = "background" | "popup" | "content" | "block-page";

interface Logger {
  log: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, err?: unknown) => void;
}

export function createLogger(context: Context): Logger {
  const prefix = `[${context}]`;

  return {
    log(message, ...args) {
      console.log(`${prefix} ${message}`, ...args);
    },
    warn(message, ...args) {
      console.warn(`${prefix} ${message}`, ...args);
    },
    error(message, err) {
      if (err instanceof MonkModeError) {
        console.error(`${prefix} ${err.name} [${err.code}] ${message}`, err);
      } else {
        console.error(`${prefix} ${message}`, err);
      }
    },
  };
}
