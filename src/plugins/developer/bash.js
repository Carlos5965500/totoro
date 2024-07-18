const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "bash",
  category: "developer",
  subcategory: "owner",
  usage: "<bash>",
  description: "Run bash commands on the server",
  dev: true,

  execute(totoro, msg, args) {
    const plugins = args.join(" ");

    if (!plugins) return;

    const { exec } = require("child_process");

    exec(plugins, async (error, stdout, stderr) => {
      if (error) {
        totoroLog.error(
          ".logs/plugins/developer/bash.log",
          `[PLUGINS] Error al ejecutar el comando bash: ${error.message}`
        );
        msg.reply(`╭──⬣「 Error 」⬣\n` + `│  ≡◦ ${error.message}\n` + `╰──⬣`);
        return;
      }

      if (stdout.trim() && stderr.trim()) {
        totoroLog.error(
          ".logs/plugins/developer/bash.log",
          `[PLUGINS] Error al ejecutar el comando bash: ${error.message}`
        );

        await msg.reply(`${stdout.trim()}`);
        return totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: stdout,
        });
      }

      if (stderr.trim()) {
        totoroLog.error(
          ".logs/plugins/developer/bash.log",
          `[PLUGINS] Error al ejecutar el comando bash: ${stderr}`
        );
        msg.reply(`╭──⬣「 Error 」⬣\n` + `│  ≡◦ ${stderr.trim()}\n` + `╰──⬣`);
        return;
      }

      msg.reply(`${stdout.trim()}`);
    });
  },
};
