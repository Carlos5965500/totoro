const totoroLog = require("../functions/totoroLog");
const { sendError } = require("../functions/messages");
module.exports = {
  name: "messages.upsert",

  async load(msg, totoro) {
    if (!msg.messages[0]?.message) return;

    if (msg.type !== "notify") return;

    if (msg.messages[0].key?.fromMe) return;

    if (msg.sender && msg.sender.is_bot) {
      return;
    }

    const { message: ctx, key } = msg.messages[0];

    require("../utils/messageUtils")(totoro, msg);

    const btn = ctx?.templateButtonReplyMessage || ctx?.buttonsResponseMessage;

    if (btn && typeof btn === "object") {
      const selected = btn?.selectedId || btn?.selectedButtonId;
      const [id, ...args] = selected.split("+");

      const component = totoro.components.get(id);
      if (!component) return;

      return component.execute(totoro, msg, args);
    }

    const body =
      ctx?.extendedTextMessage?.text ||
      ctx?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      ctx?.conversation ||
      ctx?.imageMessage?.caption ||
      ctx?.videoMessage?.caption ||
      ctx?.templateButtonReplyMessage?.selectedId ||
      ctx?.buttonsResponseMessage?.selectedButtonId;

    if (!body) return;

    if (
      !body.startsWith("!") &&
      !body.startsWith("#") &&
      !body.startsWith("$") &&
      !body.startsWith("-") &&
      !body.startsWith("+")
    ) {
      if (key.remoteJid.endsWith("@g.us")) return;

      const { chatAI } = require("../utils/chatAI");

      await totoro.sendPresenceUpdate("composing", key.remoteJid);

      const response = await chatAI(totoro, body);

      return msg.reply(response);
    }

    const args = body.slice(1).trim().split(/\s+/);
    const label = args.shift().toLowerCase();

    const command = totoro.plugins.get(label);

    if (!command) {
      const suggest = require("../utils/suggestCommand");
      return msg.reply(suggest(totoro, label));
    }

    let user = key.remoteJid;

    if (user.includes("@g.us")) user = key.participant;

    if (command.dev && !totoro.config.dev.includes(user)) return;

    command.execute(totoro, msg, args)?.catch((error) => {
      msg.reply(totoro.config.msg.error).then(() => {
        msg.react("❌");
      });

      totoroLog.error(
        "./logs/events/messages.upsert.log",
        `[COMMAND ERROR] ${error.message} ${error.stack}`
      );
    });
  },
};
