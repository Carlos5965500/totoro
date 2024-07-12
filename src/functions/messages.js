const totoroLog = require("./totoroLog"); 
const { prepareWAMessageMedia, generateWAMessageContent, generateWAMessage, sendMessage: sendBaileysMessage } = require("@whiskeysockets/baileys");

const logError = (filePath, error) => {
  totoroLog.error(filePath, `Error enviando mensaje: ${error}`);
};

const sendFormattedMessage = async (msg, message, emoji) => {
  try {
    await msg.react(emoji);
    await msg.reply(message);
  } catch (error) {
    logError("./logs/functions/messages.log", error);
  }
};

const templates = {
  mensaje: (content) =>
    `╭─⬣「 *Mensaje de Totoro* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro dice lo siguiente:*\n` +
    `╰─⬣\n` +
    `> *Mensaje*: ${content}`,

  advertencia: (content) =>
    `╭─⬣「 *Advertencia de Totoro* 」⬣\n` +
    `│  ≡◦ *⚠️ Totoro te advierte lo siguiente:*\n` +
    `╰─⬣\n` +
    `> *Advertencia*: ${content}`,

  error: (content) =>
    `╭─⬣「 *Error de Totoro* 」⬣\n` +
    `│  ≡◦ *❌ Totoro ha encontrado un error:*\n` +
    `╰─⬣\n` +
    `> *Error*: ${content}`,

  recordatorio: (nombre, userCount) =>
    `╭─⬣「 *Recordatorio de Totoro para ${nombre}* 」⬣\n` +
    `│  ≡◦ *🍭 ¡${nombre} ya eres un totoUser!*\n` +
    `│  ≡◦ *🍭 Usa +menu para ver mis comandos*\n` +
    `╰─⬣\n\n` +
    `> *Contigo somos ${userCount} totoUsers*`,

  ayuda: (titulo, msgAyuda, ejemplo) =>
    `╭─⬣「 *Ayuda de ${titulo}* 」⬣\n` +
    `│  ≡◦ ${msgAyuda}\n` +
    `╰─⬣\n` +
    `> *Ejemplo*: ${ejemplo}`,

  exito: (content) =>
    `╭─⬣「 *Éxito de Totoro* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro ha completado la tarea con éxito:*\n` +
    `╰─⬣\n` +
    `> *Éxito*: ${content}`,

  noComando: () =>
    `╭─⬣「 *Comando no encontrado* 」⬣\n` +
    `╰─ ≡◦ *🍭 Totoro no encontró el comando solicitado*\n` +
    `> *Ayuda*: Usa +menu para ver mis comandos`,
  
  registro: (nombre, edad, phone, country, serialNumber, userCount) =>
    `–  *R E G I S T R O  - T O T O  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `│  ✩  *Edad* : ${edad}\n` +
    `│  ✩  *Teléfono* : ${phone}\n` +
    `│  ✩  *País* : ${country}\n` +
    `│  ✩  *Número Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString("es-ES", { timeZone: "UTC", hour12: true })}\n` +
    `└  ✩  *Registrado* : ✅\n` +
    `> *¡Bienvenido a la comunidad de Totoro contigo ya ${userCount} totoUsers*!`
};

const emojiMap = {
  mensaje: "🍭",
  advertencia: "⚠️",
  error: "❌",
  recordatorio: "🐥",
  ayuda: "ℹ️",
  exito: "🍭",
  noComando: "❌",
};

async function sendMessage(totoro, msg, message) {
  const mensaje = templates.mensaje(message);
  await sendFormattedMessage(msg, mensaje, emojiMap.mensaje);
}

async function sendWarning(totoro, msg, warningMessage) {
  const mensaje = templates.advertencia(warningMessage);
  await sendFormattedMessage(msg, mensaje, emojiMap.advertencia);
}

async function sendError(totoro, msg, errorMessage) {
  const mensaje = templates.error(errorMessage);
  await sendFormattedMessage(msg, mensaje, emojiMap.error);
}

async function sendReminder(totoro, msg, nombre, userCount) {
  const mensaje = templates.recordatorio(nombre, userCount);
  await sendFormattedMessage(msg, mensaje, emojiMap.recordatorio);
}

async function help(totoro, msg, titulo, msgAyuda, ejemplo) {
  const mensaje = templates.ayuda(titulo, msgAyuda, ejemplo);
  await sendFormattedMessage(msg, mensaje, emojiMap.ayuda);
}

async function sendSuccess(totoro, msg, mensajeExito) {
  const mensaje = templates.exito(mensajeExito);
  await sendFormattedMessage(msg, mensaje, emojiMap.exito);
}

async function noCommand(totoro, msg) {
  const mensaje = templates.noComando();
  await sendFormattedMessage(msg, mensaje, emojiMap.noComando);
}

async function totoreact(msg, emoji) {
  try {
    await msg.react(emoji);
  } catch (error) {
    logError("./logs/functions/messages.log", `[FUNCTION ERROR] ${error.message} ${error.stack}`);
  }
}

async function sendReg(totoro, remoteJid, phone, nombre, edad, serialNumber, country, userCount) {
  const mensaje = templates.registro(nombre, edad, phone, country, serialNumber, userCount);
  try {
    await totoro.sendMessage(remoteJid, { text: mensaje });
  } catch (error) {
    logError("./logs/plugins/register/register.js", error);
  }
}

async function sendMediaMessage(msg, mediaType, mediaContent) {
  try {
    const validMediaTypes = ["image", "video", "audio", "document", "sticker"];
    if (!validMediaTypes.includes(mediaType)) throw new Error("Invalid media type");

    const preparedMedia = await prepareWAMessageMedia({ [mediaType]: mediaContent }, { upload: yourUploadFunction });
    const messageContent = generateWAMessageContent(preparedMedia, { quoted: msg });
    const waMessage = generateWAMessage(msg.key.remoteJid, messageContent);

    await sendBaileysMessage(msg.key.remoteJid, waMessage.message);
  } catch (error) {
    logError("./logs/functions/messages.log", `Error enviando mensaje con media: ${error}`);
  }
}

module.exports = {
  sendMediaMessage,
  sendReminder,
  sendWarning,
  sendSuccess,
  sendMessage,
  noCommand,
  totoreact,
  sendError,
  sendReg,
  help,
};
