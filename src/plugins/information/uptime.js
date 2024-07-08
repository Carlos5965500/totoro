const runtime = require("../../functions/runtime");
const moment = require("moment-timezone");

let lastRestartTime = new Date();
let lastDowntime = null;

module.exports = {
  name: "uptime",
  category: "information",
  subcategory: "general",
  aliases: ["up", "tiempo", "conexión", "totoconexión", "totoconn", "totouptime"],
  description: "tiempo de conexion del bot.",
  onlyGroup: false,

  async execute(totoro, msg) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    try {
      const uptimeString = await runtime(process.uptime());
      const userTimezone = getUserTimezone();
      const lastRestartUserTime = formatDate(lastRestartTime, userTimezone);
      const downtimeMessage = getDowntimeMessage(userTimezone);

      reply(
        `╭─⬣「 *Totoro Uptime* 」⬣\n` +
        `│ 🍭 Conexión: \`${uptimeString}\`\n` +
        `│ 🍭 Últ. reinicio: \`${lastRestartUserTime}\`\n` +
        `╰─⬣`
      );

    } catch (e) {
      reply(`Error: ${e.message}`);
    }
  },
};

// Actualiza la última hora de reinicio al iniciar el bot
lastRestartTime = new Date();

function getUserTimezone() {
  return moment.tz.guess() || "UTC";
}

function formatDate(timestamp, timezone) {
  return moment(timestamp).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
}

function getDowntimeMessage(userTimezone) {
  if (lastDowntime) {
    const downtimeUserTime = formatDate(lastDowntime, userTimezone);
    return `⚠️ El bot se ha reiniciado o ha estado inactivo en algún momento: ${downtimeUserTime}\n`;
  }
  return "";
}

function updateDowntime() {
  lastDowntime = new Date();
}