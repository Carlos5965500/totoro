const { text } = require("express");
const totoroLog = require("./totoroLog");
const path = require("path");
const { info } = require("console");

async function sendMessage(totoro, msg, message) {
  const mensaje =
    `╭─⬣「 *Mensaje de Totoro* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro dice lo siguiente:*\n` +
    `│  ≡◦ ${message}\n` +
    `╰─⬣`;
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    msg.react("🍭");
    await totoro.sendMessage(remoteJid, { text: mensaje });
  } catch (error) {
    totoroLog.error(
      path.join(__dirname, "./logs/functions/messages.log"),
      `Error enviando mensaje: ${error}`
    );
  }
}

async function sendWarning(totoro, msg, warningMessage) {
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await msg.react("⚠️");
    await totoro.sendMessage(remoteJid, {
      text:
        `╭─⬣「 *Advertencia* 」⬣\n` +
        `│  ≡◦ *⚠️ Totoro te advierte lo siguiente:*\n` +
        `╰─⬣\n` +
        `> *Advertencia*: ${warningMessage}`,
    });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function sendError(totoro, msg, errorMessage) {
  const mensaje =
    `╭─⬣「 *Error* 」⬣\n` +
    `│  ≡◦ *❌ Totoro ha encontrado un error*\n` +
    `╰─⬣\n` +
    `> ${errorMessage}`;
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    console.log(remoteJid);
    msg.react("❌");
    await totoro.sendMessage(remoteJid, { text: mensaje });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de error: ${error}`
    );
  }
}
async function sendReminder(totoro, msg, nombre, userCount) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const reminderMessage =
    `╭─⬣「 *Recordatorio de Toto para ${nombre}* 」⬣\n` +
    `│  ≡◦  *🍭 ¡${nombre} ya eres un totoUser!*\n` +
    `│  ≡◦  *🍭 Usa +menu para ver mis comandos*\n` +
    `╰─⬣\n\n` +
    `> *Contigo somos ${userCount} totoUsers*`;

  try {
    await msg.react("🐥");
    await totoro.sendMessage(remoteJid, { text: reminderMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de recordatorio: ${error}`
    );
  }
}

async function help(totoro, msg, titulo, msgAyuda, ejemplo) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const helpMessage =
    `╭─⬣「 *Ayuda de ${titulo}* 」⬣\n` +
    `│  ≡◦ ${msgAyuda}\n` +
    `╰─⬣\n` +
    `> *Ejemplo*: ${ejemplo}`;
  try {
    await msg.react("ℹ️");
    await totoro.sendMessage(remoteJid, { text: helpMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de ayuda: ${error}`
    );
  }
}

async function sendSuccess(totoro, msg, mensajeExito) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const successMessage =
    `╭─⬣「 *Éxito* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro ha completado la acción*\n` +
    `╰─⬣\n` +
    `> *Éxito*: ${mensajeExito}`;
  try {
    await msg.react("🍭");
    await totoro.sendMessage(remoteJid, { text: successMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de éxito: ${error}`
    );
  }
}

async function noCommand(totoro, msg, suggestCommand) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const noCommandMessage =
    `╭─⬣「 *Comando no encontrado* 」⬣\n` +
    `│  ≡◦ *🍭 Totoro no encontró el comando solicitado*\n` +
    `│  ≡◦ *🍭 Usa +menu para ver mis comandos*\n` +
    `╰─⬣\n` +
    `> ${suggestCommand}`;
  try {
    await msg.react("🔍");
    await totoro.sendMessage(remoteJid, { text: noCommandMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de comando no encontrado: ${error}`
    );
  }
}

// Función para verficar que no estas registrado
async function infoRegister(msg, warningMessage) {
  try {
    await msg.react("⚠️");
    msg.reply(
      `╭─⬣「 *TotoUser* 」⬣\n` +
        `│  ≡◦ *ℹ️  No registrado*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

// Función para verficar que no eres premium
async function infoPremium(msg, warningMessage) {
  try {
    await msg.react("ℹ️");
    await msg.reply(
      `╭─⬣「 *TotoPremium* 」⬣\n` +
        `│  ≡◦ *⚠️ No eres Premium*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function infoSerial(msg, warningMessage) {
  try {
    await msg.react("ℹ️");
    await msg.reply(
      `╭─⬣「 *Número de Serie* 」⬣\n` +
        `│  ≡◦ *⚠️ No tienes número de serie*\n` +
        `╰─⬣\n` +
        `> ${warningMessage}`
    );
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de aviso: ${error}`
    );
  }
}

async function sendSerial(msg, userName, serialNumber) {
  try {
    await msg.react("🔍");
    await msg.reply(
      `╭─⬣「 *Número de Serie* 」⬣\n` +
        `│  ≡◦ *ℹ️ Totoro generó una licencia para ${userName}*\n` +
        `│  ≡◦ *ℹ️ Tu número de serie es*\n` +
        `╰─⬣\n` +
        `> ${serialNumber}`
    );
  } catch (error) {
    console.error(`Error enviando mensaje de aviso: ${error}`);
  }
}

async function sendReg(
  totoro,
  remoteJid,
  phone,
  nombre,
  edad,
  serialNumber,
  country,
  userCount
) {
  const registrationMessage =
    `–  *R E G I S T R O  - T O T O  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `│  ✩  *Edad* : ${edad}\n` +
    `│  ✩  *Teléfono* : ${phone}\n` +
    `│  ✩  *País* : ${country}\n` +
    `│  ✩  *Número Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString("es-ES", { timeZone: "UTC", hour12: true })}\n` +
    `└  ✩  *Registrado* : ✅\n` +
    `> *¡Bienvenido a la comunidad de Totorolandia contigo ya ${userCount} totoUsers*!`;

  try {
    await totoro.sendMessage(remoteJid, { text: registrationMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de registro: ${error}`
    );
  }
}

async function sendPrem(
  totoro,
  remoteJid,
  phone,
  nombre,
  edad,
  serialNumber,
  country,
  userCount
) {
  const registrationPremiumMessage =
    `–  *R E G I S T R O  - T O T O  P R E M I U M  U S E R*   –\n` +
    `┌  ✩  *Nombre* : ${nombre}\n` +
    `├  ✩  *Edad* : ${edad}\n` +
    `├  ✩  *Teléfono* : ${phone}\n` +
    `├  ✩  *País* : ${country}\n` +
    `├  ✩  *Serial* : ${serialNumber}\n` +
    `│  ✩  *Fecha de Registro* : ${new Date().toLocaleString("es-ES", { timeZone: "UTC", hour12: true })}\n` +
    `└  ✩  *Premium* : ✅\n` +
    `> *¡Bienvenido a la Membresía Premiun de Totoro contigo ya ${userCount} totoPremium*!`;
  try {
    await totoro.sendMessage(remoteJid, { text: registrationPremiumMessage });
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje de registro: ${error}`
    );
  }
}

// Función para enviar un mensaje con media
async function sendMediaMessage(msg, mediaType, mediaContent) {
  const {
    prepareWAMessageMedia,
    generateWAMessageContent,
    generateWAMessage,
    sendMessage,
  } = require("@whiskeysockets/baileys");
  try {
    // Verifica que el tipo de media sea válido
    const validMediaTypes = ["image", "video", "audio", "document", "sticker"];
    if (!validMediaTypes.includes(mediaType)) {
      throw new Error("Invalid media type");
    }

    const preparedMedia = await prepareWAMessageMedia(
      { [mediaType]: mediaContent },
      { upload: yourUploadFunction }
    );
    const messageContent = generateWAMessageContent(preparedMedia, {
      quoted: msg,
    });
    const waMessage = generateWAMessage(msg.key.remoteJid, messageContent);

    await sendMessage(msg.key.remoteJid, waMessage.message);
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `Error enviando mensaje con media: ${error}`
    );
  }
}

module.exports = {
  sendMediaMessage,
  infoRegister,
  sendReminder,
  sendWarning,
  sendSuccess,
  sendMessage,
  infoPremium,
  infoSerial,
  sendSerial,
  noCommand,
  sendError,
  sendPrem,
  sendReg,
  help,
};
