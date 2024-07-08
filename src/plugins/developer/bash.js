module.exports = {
  name: "bash",
  category: "developer",
  subcategory: "owner",
  usage: "<bash>",
  description: "Run bash commands on the server",
  dev: true,

  execute(sock, msg, args) {
    const plugins = args.join(" ");

    if (!plugins) return;

    const { exec } = require("child_process");

    exec(plugins, async (error, stdout, stderr) => {
      if (error) {
        msg.reply(`Error: ${error.message}`);
        return;
      }

      if (stdout.trim() && stderr.trim()) {
        await msg.reply(stderr);
        return sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: stdout,
        });
      }

      if (stderr.trim()) {
        msg.reply(stderr.trim());
        return;
      }

      msg.reply(stdout.trim());
    });
  },
};
