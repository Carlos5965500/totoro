const winston = require("winston");
const path = require("path");

const createLogger = (logFilePath) => {
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
    const logger = createLogger(logFilePath);
    logger.log(logLevel, message);
  };
};

const totoroLog = {
  error: createLogFunction("error"),
  success: createLogFunction("info"), // El nivel 'success' no existe en winston, usaremos 'info'
  warn: createLogFunction("warn"),
  info: createLogFunction("info"),
  http: createLogFunction("http"),
  verbose: createLogFunction("verbose"),
  debug: createLogFunction("debug"),
  silly: createLogFunction("silly"),
  react: createLogFunction("info"), // El nivel 'react' no existe en winston, usaremos 'info'
  rejectCallback: (logFilePath, error) => {
    const logger = createLogger(logFilePath);
    logger.error(`Error: ${error.message}\nStack: ${error.stack}`);
  },
  resolveCallback: (logFilePath, message) => {
    const logger = createLogger(logFilePath);
    logger.info(message);
  },
};

module.exports = totoroLog;
