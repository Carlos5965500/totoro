const whatsapp = require("@whiskeysockets/baileys");
const discord = require("@discordjs/collection");
const pino = require("pino");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const AUTH_DATA_DIR = path.join(__dirname, "..", "auth", "totoro-auth")
async function connectToTotoro() {
  const { state, saveCreds } =
    await whatsapp.useMultiFileAuthState(AUTH_DATA_DIR);

  const totoro = whatsapp.makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
  });

  totoro.plugins = new discord.Collection();
  totoro.components = new discord.Collection();

  const folder = await fs.promises.readdir("./src/handlers");

  for (const file of folder) {
    const handler = require(`./handlers/${file}`);

    if (typeof handler === "function") {
      handler(totoro);
    }
  }

  totoro.ev.on("creds.update", saveCreds);

  totoro.config = require("../settings.json");
}

connectToTotoro();

const totoDB = require("../src/libs/db/totoDB");
const db = new totoDB();
const syncTotoDB = require("../src/scripts/sync");
const sync = new syncTotoDB();

db.isConnected().catch((err) =>
  console.log("Error connecting to the database: ", err)
);
sync
  .sync()
  .catch((err) => console.log("Error al sincronizar la base de datos: ", err));

module.exports = { connectToTotoro };

/* Code by Walter */
