const totoroLog = require("./totoroLog");

async function sendWarning(totoro, msg, warningMessage) {
  try {
    const remoteJid = msg.messages[0].key.remoteJid;
    await msg.react("⚠️");
    await totoro.sendMessage(remoteJid, {
      text: `╭─⬣「 *Aviso* 」⬣\n╰─ ≡◦ *🍭 Totoro te avisa lo siguiente:*\n> *Aviso*: ${warningMessage}`,
    });
  } catch (error) {
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de aviso: ${error}`);
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
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de error: ${error}`);
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
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de recordatorio: ${error}`);
  }
}

async function help(totoro, msg, titulo, msgAyuda, ejemplo) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const helpMessage =
    `╭─⬣「 *Ayuda de ${titulo}* 」⬣\n` +
    `│  ≡◦ ${msgAyuda}\n` +
    `╰─⬣\n`+ 
    `> *Ejemplo*: ${ejemplo}`;
  try {
    await msg.react("ℹ️");
    await totoro.sendMessage(remoteJid, { text: helpMessage });
  } catch (error) {
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de ayuda: ${error}`);
  }
}

async function sendSuccess(totoro, msg) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const successMessage = 
  `╭─⬣「 *Éxito* 」⬣` +
  `╰─ ≡◦ *🍭 Totoro ha completado la acción*\n`+
  `> *Éxito*: ${msg}`; 
  try { 
    await msg.react("🍭");
    await totoro.sendMessage(remoteJid, { text: successMessage });
  } catch (error) {
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de éxito: ${error}`);
  }
}

async function noCommand(totoro, msg,) {
  const remoteJid = msg.messages[0].key.remoteJid;
  const noCommandMessage = 
  `╭─⬣「 *Comando no encontrado* 」⬣` +
  `╰─ ≡◦ *🍭 Totoro no encontró el comando solicitado*\n`+
  `> *Ayuda*: Usa +menu para ver mis comandos`; 
  try { 
    await msg.react("❌");
    await totoro.sendMessage(remoteJid, { text: noCommandMessage });
  } catch (error) {
    totoroLog.error("./logs/functions/messages.log", `Error enviando mensaje de comando no encontrado: ${error}`);
  }
}

async function totoreact(msg, emoji) {
  try { 
    await msg.react(emoji);
  } catch (error) {
    totoroLog.error(
      "./logs/functions/messages.log",
      `[FUNCTION ERROR] ${error.message} ${error.stack}`
    )
  }
}

async function sendReg(totoro, remoteJid, phone, nombre, edad, serialNumber, country, userCount) {
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

module.exports = {
  sendWarning,
  sendError,
  sendReminder,
  sendSuccess,
  help, 
  sendReg,
  noCommand,
  totoreact,
};
