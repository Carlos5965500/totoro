const { DisconnectReason } = require("@whiskeysockets/baileys");
const { connectToWA } = require("../index.js");
const { Boom } = require("@hapi/boom");
const { render } = require("cfonts");

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

      console.log("- [ MOMO ] Connected to WA");
    }
  },
};
