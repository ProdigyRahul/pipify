import { NODE_ENV as NODE } from "@/utils/variables";
import morgan from "morgan";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";

// Environment variables
const NODE_ENV = NODE || "development";
const LOG_DIR = path.resolve(__dirname, "..", "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Winston logger setup
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "white",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.prettyPrint(),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new DailyRotateFile({
    filename: `${LOG_DIR}/error-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
  }),
  new DailyRotateFile({
    filename: `${LOG_DIR}/combined-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  }),
];

export const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

// Morgan middleware setup
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

const skip = () => NODE_ENV !== "development";

export const morganMiddleware = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
