const { createHash } = require("crypto");
const totoUser = require("../../models/totoUser");
const countTotoUsers = require("../../functions/countTotoUsers");
const forbiddenWords = require("../../../settings.json").forbiddenWords;
const urlRegex = /https?:\/\/[^\s]+/;
const domainRegex = /[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/;
const numberRegex = /\d/;
const invalidCharsRegex = /[^a-zA-Z0-9]/;
const repeatedCharsRegex = /(.)\1{2,}/; 
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "register",
  description: "Registra un totoUser en la base de datos",
  usage: "register <nombre>.<edad>",
  aliases: ["reg"],
  
  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const [nombre, edad] = args.join(" ").split(".");
      if (!nombre || !edad || isNaN(edad)) {
        await help(totoro, remoteJid);
        await msg.react("❓");
        return;
      }

      // Validación de edad
      const edadInt = parseInt(edad, 10);
      if (edadInt < 12 || edadInt > 40) {
        await sendWarning(totoro, msg, `No puede registrarse a totoUser con ${edadInt} años.`);
        return;
      }

      // Validación de longitud de nombre, palabras obscenas, URLs, fragmentos de dominios, números en el nombre y caracteres no permitidos
      if (
        nombre.length > 10 ||
        forbiddenWords.some((word) => nombre.includes(word)) ||
        urlRegex.test(nombre) ||
        domainRegex.test(nombre) ||
        numberRegex.test(nombre) ||
        invalidCharsRegex.test(nombre) ||
        repeatedCharsRegex.test(nombre)
      ) {
        await sendWarning(totoro, msg, "El nombre debe tener un máximo de 10 caracteres y no contener palabras no permitidas, URLs, fragmentos de dominios, números, caracteres inválidos o repeticiones de caracteres.");
        return;
      }

      // Obtener número de teléfono directamente
      let telf = msg.messages[0].key.remoteJid;
      if (telf.includes("g.us")) {
        telf = msg.messages[0].key.participant;
      }
      
      const phone = telf.split("@")[0];

      const country = getCountryFromPhoneNumber(phone);
      if (!country) {
        await sendWarning(totoro, msg, `No se pudo obtener el país del número de teléfono ${phone}.`);
        return;
      }

      // Generar un hash MD5 del nombre para el serialNumber
      const serialNumber = createHash("md5").update(nombre).digest("hex");
      const userCount = await countTotoUsers();
      
      // Buscar el usuario
      let user = await totoUser.findOne({ where: { phone: phone } });
      if (user) {
        await sendReminder(totoro, remoteJid, nombre, userCount);
        await msg.react("ℹ️");
        return;
      }

      // Registrar nuevo usuario
      await registerNewUser(phone, nombre, edadInt, serialNumber, country);
      await sendRegistrationMessage(totoro, remoteJid, phone, nombre, edadInt, serialNumber, country, userCount + 1);
      await msg.react("🍭");
    } catch (error) {
      totoroLog.error(
        './logs/plugins/register/register.js',
        `Error al registrar usuario: ${error}`
      );
      await sendError(totoro, msg, "Error al registrar usuario.");
    }
  },
};

async function help(totoro, remoteJid) {
  const helpMessage =
    `╭─⬣「 *Ayuda de Registro* 」⬣\n` +
    `│  ≡◦  *🍭 Ingresa tu nombre y edad*\n` +
    `╰─⬣\n` +
    `> *Ejemplo*: +reg Nia.22`;
  try {
    await totoro.sendMessage(remoteJid, { text: helpMessage });
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error enviando mensaje de ayuda: ${error}`
    );
  }
}

async function sendWarning(totoro, msg, warningMessage) {
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await msg.react("⚠️");
    await totoro.sendMessage(remoteJid, {
      text: `╭─⬣「 *Aviso* 」⬣\n╰─ ≡◦ *🍭 Totoro te avisa lo siguiente:*\n> *Aviso*: ${warningMessage}`,
    });
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function sendError(totoro, msg, errorMessage) {
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await msg.react("❌");
    await totoro.sendMessage(remoteJid, {
      text: `╭─⬣「 *Error* 」⬣\n╰─ ≡◦ *🍭 Totoro está experimentando un error*\n> *Error*: ${errorMessage}`,
    });
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error enviando mensaje de error: ${error}`
    );
  }
}

async function sendReminder(totoro, remoteJid, nombre, userCount) {
  const reminderMessage =
    `╭─⬣「 *Recordatorio de Toto para ${nombre}* 」⬣\n` +
    `│  ≡◦  *🍭 ¡${nombre} ya eres un totoUser!*\n` +
    `│  ≡◦  *🍭 Usa +menu para ver mis comandos*\n` +
    `╰─⬣\n\n` +
    `> *Contigo somos ${userCount} totoUsers*`;

  try {
    await totoro.sendMessage(remoteJid, { text: reminderMessage });
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error enviando mensaje de recordatorio: ${error}`
    );
  }
}

async function registerNewUser(phone, nombre, edad, serialNumber, country) {
  try {
    const user = new totoUser({
      phone: phone,
      name: nombre,
      age: edad,
      serialNumber: serialNumber,
      country: country
    });
    await user.save();
    return user;
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error al registrar usuario: ${error}`
    );
  }
}

async function sendRegistrationMessage(totoro, remoteJid, phone, nombre, edad, serialNumber, country, userCount) {
  const registrationMessage =
    `–  *R E G I S T R O  - T O T O  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `│  ✩  *Edad* : ${edad}\n` +
    `│  ✩  *Teléfono* : ${phone}\n` +
    `│  ✩  *País* : ${country}\n` +
    `│  ✩  *Número Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString('es-ES', { timeZone: 'UTC', hour12: true })}\n` +
    `└  ✩  *Registrado* : ✅\n` +
    `> *¡Bienvenido a la comunidad de Totoro contigo ya ${userCount} totoUsers*!`;

  try {
    await totoro.sendMessage(remoteJid, { text: registrationMessage });
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error enviando mensaje de registro: ${error}`
    );
  }
}

function getCountryFromPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "Desconocido";
  
  const { parsePhoneNumberFromString } = require("libphonenumber-js");
  const paises = require("../../../paises.json");
  
  const extract = parsePhoneNumberFromString("+" + phoneNumber);

  return paises[extract?.countryCallingCode] || "Desconocido";
}
