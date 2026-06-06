import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type LogLevel = "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "../../logs");
const logFile = path.join(logDir, "app.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const writeLog = async (entry: LogEntry): Promise<void> => {
  try {
    await fs.promises.appendFile(logFile, `${JSON.stringify(entry)}\n`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown log write error";
    console.error({ level: "error", message: "Log write error", details: message });
  }
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: LogMeta;
}

const createLogEntry = (level: LogLevel, message: string, meta?: LogMeta): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  ...(meta ? { meta } : {}),
});

const logToConsole = (entry: LogEntry): void => {
  if (entry.level === "error") {
    console.error(entry);
    return;
  }

  if (entry.level === "warn") {
    console.warn(entry);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(entry);
  }
};

export const logger = {
  info(message: string, meta?: LogMeta): void {
    const entry = createLogEntry("info", message, meta);
    logToConsole(entry);
    void writeLog(entry);
  },

  warn(message: string, meta?: LogMeta): void {
    const entry = createLogEntry("warn", message, meta);
    logToConsole(entry);
    void writeLog(entry);
  },

  error(message: string, meta?: LogMeta): void {
    const entry = createLogEntry("error", message, meta);
    logToConsole(entry);
    void writeLog(entry);
  },
};
