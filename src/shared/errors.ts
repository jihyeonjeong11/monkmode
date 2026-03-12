export class MonkModeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = "MonkModeError";
    if (cause) this.cause = cause;
  }
}

export class StorageError extends MonkModeError {
  constructor(message: string, cause?: unknown) {
    super("STORAGE_ERROR", message, cause);
    this.name = "StorageError";
  }
}

export class AlarmError extends MonkModeError {
  constructor(message: string, cause?: unknown) {
    super("ALARM_ERROR", message, cause);
    this.name = "AlarmError";
  }
}

export class DnrError extends MonkModeError {
  constructor(message: string, cause?: unknown) {
    super("DNR_ERROR", message, cause);
    this.name = "DnrError";
  }
}

export class MessageError extends MonkModeError {
  constructor(message: string, cause?: unknown) {
    super("MESSAGE_ERROR", message, cause);
    this.name = "MessageError";
  }
}
