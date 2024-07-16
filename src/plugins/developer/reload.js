const e = require("express");
const loadplugins = require("../../handlers/plugins");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "reload",
  category: "developer",
  subcategory: "owner",
  usage: "<reload>",
  aliases: ["recargar", "recarga", "rl", "r"],
  description: "Recarga los plugins",
  dev: true,

  async execute(totoro, msg, _) {
    totoro.plugins.clear();

    await loadplugins(totoro);

    if (!totoro.plugins.size) {
      totoroLog.error(
        totoroLog.verbose,
        "./logs/plugins/developer/reload.log",
        "[PLUGINS] No se encontraron plugins."
      );
      msg.reply(
        `╭──⬣「 Recargado 」⬣\n` +
          `│  ≡◦ 🍭 Plugins\n` +
          `╰──⬣` +
          `> No se encontraron plugins.`
      );
    }
    msg.reply(
      `╭──⬣「 Totoro recargando 」⬣\n` +
        `│  ≡◦ 🍭  Plugins\n` +
        `╰──⬣\n` +
        `> ${totoro.plugins.size} plugins recargados.`
    );
  },
};
