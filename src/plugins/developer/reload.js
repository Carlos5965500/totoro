const loadplugins = require("../../handlers/plugins");

module.exports = {
  name: "reload",
  category: "developer",
  subcategory: "owner",
  usage: "<reload>",
  description: "Recarga los plugins",
  dev: true,

  async execute(sock, msg, _) {
    sock.plugins.clear();

    await loadplugins(sock);

    msg.reply(`*plugins* recargados con éxito.`);
  },
};
