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
        msg.reply(`╭──⬣「 Error 」⬣\n│  ≡◦ ${error.message}\n╰──⬣`);
        return;
      }

      if (stdout.trim() && stderr.trim()) {
        await msg.reply(
          `╭──⬣「 Output 」⬣\n│  ≡◦ ${stderr}\n╰──⬣`)
        return totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: stdout,
        });
      }

      if (stderr.trim()) {
        msg.reply( `╭──⬣「 Error 」⬣\n│  ≡◦ ${stderr.trim()}\n╰──⬣`);
        return;
      }

      msg.reply(
        `╭──⬣「 Output 」⬣\n│  ≡◦ ${stdout.trim()}\n╰──⬣`
      );
    });
  },
};
