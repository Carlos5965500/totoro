const {
  makeWASocket,
  useMultiFileAuthState,
  msgRetryCounterCache,
  makeCacheableSignalKeyStore,
  delay,
} = require("@whiskeysockets/baileys");
const discord = require("@discordjs/collection");
const pino = require("pino");
const fs = require("fs");
const readline = require("readline");
const path = require("path"); 

// Carga las variables de entorno desde .env
require("dotenv").config();

process.loadEnvFile = function () {
  require("dotenv").config();
}; 

// Define el directorio donde se guardará pairing_data.json
const PAIRING_DATA_DIR = path.join(__dirname, "..", "auth", "momo-pairing"); // Reemplaza 'pairing_data_directory' con tu directorio deseado

// Define el directorio donde se guardará momo-auth
const AUTH_DATA_DIR = path.join(__dirname, "..", "auth", "momo-auth"); // Reemplaza 'auth_directory' con tu directorio deseado

// Crear los directorios si no existen de manera recursiva
if (!fs.existsSync(PAIRING_DATA_DIR)) {
  fs.mkdirSync(PAIRING_DATA_DIR, { recursive: true });
}

if (!fs.existsSync(AUTH_DATA_DIR)) {
  fs.mkdirSync(AUTH_DATA_DIR, { recursive: true });
}

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function connectToTotoro() {
  // Manejo de errores para la autenticación
  let state, saveCreds;
  try {
    // Utiliza el directorio especificado para guardar momo-auth
    ({ state, saveCreds } = await useMultiFileAuthState(AUTH_DATA_DIR));
  } catch (err) {
    console.error("Error al obtener el estado de autenticación:", err);
    return;
  }

  const logger = pino({ level: "silent" });

  const momo = makeWASocket({
    logger: logger,
    printQRInTerminal: false,
    browser: ["Mac OS", "chrome", "121.0.6167.159"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
  });

  momo.ev.on("creds.update", saveCreds);

  if (!momo.authState.creds.registered) {
    await delay(5000);
    const phoneNumber = await question(
      "Ingresa tu número de teléfono de WhatsApp: "
    );
    const code = await momo.requestPairingCode(phoneNumber);
    console.log(`Emparejando con este código: ${code}`);

    // Guardar pairing_data.json en el directorio específico
    const pairingDataPath = path.join(PAIRING_DATA_DIR, "pairing_data.json");
    fs.writeFileSync(pairingDataPath, JSON.stringify({ code }, null, 2));
  }

  momo.plugins = new discord.Collection();
  momo.components = new discord.Collection();

  let folder;
  try {
    folder = await fs.promises.readdir(path.join(__dirname, "handlers"));
  } catch (err) {
    console.error("Error al leer el directorio de handlers:", err);
    return;
  }

  for (const file of folder) {
    const handlerPath = path.join(__dirname, "handlers", file);
    try {
      const handler = require(handlerPath);
      if (typeof handler === "function") {
        handler(momo);
      }
    } catch (err) {
      console.error(`Error al cargar el handler ${file}:`, err);
    }
  }

  try {
    momo.config = require(path.join(__dirname, "..", "settings.json"));
  } catch (err) {
    console.error("Error al cargar settings.json:", err);
  }
}

const totoDB = require("../src/libs/db/totoDB");
const db = new totoDB();
const syncTotoDB = require("../src/scripts/sync");
const sync = new syncTotoDB();

db.isConnected().catch((err) => console.log("Error connecting to the database: ", err));
sync.sync().catch((err) => console.log("Error al sincronizar la base de datos: ", err));
connectToTotoro().catch((err) => console.log("Error connecting to WA: ", err));

module.exports = { connectToTotoro };
