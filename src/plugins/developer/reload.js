const e = require("express");
const loadplugins = require("../../handlers/plugins");

module.exports = {
  name: "reload",
  category: "developer",
  subcategory: "owner",
  usage: "<reload>",
  description: "Recarga los plugins",
  dev: true,

  async execute(totoro, msg, _) {
    totoro.plugins.clear();

    await loadplugins(totoro);

    if (!totoro.plugins.size) {
      return msg.reply(
        `╭──⬣「 Error 」⬣\n│  ≡◦ No hay plugins para recargar.\n╰──⬣`
      );
    } 
    msg.reply(
      `╭──⬣「 Recargado de Plugins 」⬣\n│  ≡◦ ${totoro.plugins.size} plugins recargados.\n╰──⬣`
    ); 
  },
};
