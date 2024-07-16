const { exec } = require("child_process");
const totoroLog = require("../../functions/totoroLog");
const { sendError } = require("../../functions/messages");

module.exports = {
  name: "restart",
  category: "developer",
  subcategory: "system",
  description: "Reiniciar el servidor.",
  usage: "<restart>",
  dev: true,

  async execute(totoro, msg) {
    try {
      const remoteJid = msg?.messages?.[0]?.key?.remoteJid;

      totoroLog.info(
        "./logs/plugins/developer/restart.log",
        `Reiniciando el servidor...`
      );
      await totoro.sendMessage(remoteJid, {
        text:
          `╭─⬣「 Totoro 」⬣\n` +
          `│  ≡◦  🍭 Reiniciando el servidor...\n` +
          `╰─⬣\n` +
          `> Reiniciando el servidor...`,
      });

      exec("pm2 restart totoro", (error, stdout, stderr) => {
        if (error) {
          totoroLog.error(
            "./logs/plugins/developer/restart.log",
            `Error al reiniciar el servidor: ${error.message}`
          );
          sendError(
            totoro,
            msg,
            `Error al reiniciar el servidor: ${error.message}`
          );
          return;
        }

        if (stderr) {
          totoroLog.error(
            "./logs/plugins/developer/restart.log",
            `Error al reiniciar el servidor: ${stderr}`
          );
          sendError(totoro, msg, `Error al reiniciar el servidor: ${stderr}`);
          return;
        }
      });
      process.exit();
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/developer/restart.log",
        `Error al reiniciar el servidor: ${error.message}`
      );
      if (msg && msg.key && msg.key.remoteJid) {
        sendError(
          totoro,
          msg,
          `Error al reiniciar el servidor: ${error.message}`
        );
      }
    }
  },
};
