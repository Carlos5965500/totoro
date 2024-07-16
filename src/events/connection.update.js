const { DisconnectReason } = require("@whiskeysockets/baileys");
const { connectToWA } = require("../index");
const { Boom } = require("@hapi/boom");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  name: "connection.update",

  async load(update) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log(
        "connection closed due to",
        lastDisconnect.error,
        ", reconnecting",
        shouldReconnect
      );

      if (shouldReconnect) {
        await connectToWA();
      }
    } else if (connection === "open") {
      totoroLog.info(
        "./logs/handlers/connection.log",
        `[CONNECTION] ${connection}`
      );
    }
  },
};
