const winston = require("winston");

const createLogger = (logFilePath) => {
  if (typeof logFilePath !== "string") {
    throw new TypeError(
      `LogFilePath tiene que ser un string pero es ${typeof logFilePath}`
    );
  }
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
      )
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: logFilePath }),
    ],
  });
};

const createLogFunction = (logLevel) => {
  return (logFilePath, message) => {
    if (typeof logFilePath !== "string") {
      throw new TypeError(
        `LogFilePath tiene que ser un string pero es ${typeof logFilePath}`
      );
    }
    const logger = createLogger(logFilePath);
    logger.log(logLevel, message);
  };
};

const totoroLog = {
  error: createLogFunction("error"),
  success: createLogFunction("info"),
  warn: createLogFunction("warn"),
  info: createLogFunction("info"),
  http: createLogFunction("http"),
  verbose: createLogFunction("verbose"),
  debug: createLogFunction("debug"),
  silly: createLogFunction("silly"),
  react: createLogFunction("info"),
  rejectCallback: (logFilePath, error) => {
    if (typeof logFilePath !== "string") {
      throw new TypeError(
        `LogFilePath tiene que ser un string pero es ${typeof logFilePath}`
      );
    }
    const logger = createLogger(logFilePath);
    logger.error(`Error: ${error.message}\nStack: ${error.stack}`);
  },
  resolveCallback: (logFilePath, message) => {
    if (typeof logFilePath !== "string") {
      throw new TypeError(
        `LogFilePath tiene que ser un string pero es ${typeof logFilePath}`
      );
    }
    const logger = createLogger(logFilePath);
    logger.info(message);
  },
};

module.exports = totoroLog;
