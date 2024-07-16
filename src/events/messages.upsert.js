const {
  sendWarning,
  noCommand,
  infoRegister,
} = require("../functions/messages");
const { matcher } = require("../functions/matcher");
module.exports = {
  name: "messages.upsert",

  async load(msg, totoro) {
    if (!msg.messages[0]?.message) return;

    if (msg.type !== "notify") return;

    if (msg.messages[0].key?.fromMe) return;

    if (msg.sender && msg.sender.is_bot) {
      return;
    }

    const { message: toto, key } = msg.messages[0];

    require("../utils/messageUtils")(totoro, msg);

    const btn =
      toto?.templateButtonReplyMessage || toto?.buttonsResponseMessage;

    if (btn && typeof btn === "object") {
      const selected = btn?.selectedId || btn?.selectedButtonId;
      const [id, ...args] = selected.split("+");

      const component = totoro.components.get(id);
      if (!component) return;

      return component.execute(totoro, msg, args);
    }

    const body =
      toto?.extendedTextMessage?.text ||
      toto?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      toto?.conversation ||
      toto?.imageMessage?.caption ||
      toto?.videoMessage?.caption ||
      toto?.templateButtonReplyMessage?.selectedId ||
      toto?.buttonsResponseMessage?.selectedButtonId;

    if (!body) return;

    if (
      !body.startsWith("!") &&
      !body.startsWith("#") &&
      !body.startsWith("$") &&
      !body.startsWith("-") &&
      !body.startsWith("+")
    ) {
      if (key.remoteJid.endsWith("@g.us")) return;

      const verifyPremium = require("../utils/verifypremium");
      const premium = await verifyPremium(key.remoteJid, totoro, msg);
      if (!premium) return;

      const { chatAI } = require("../utils/chatAI");

      await totoro.sendPresenceUpdate("composing", key.remoteJid);

      const response = await chatAI(totoro, body);

      return msg.reply(response);
    }

    const args = body.slice(1).trim().split(/\s+/);
    const pluginName = args.shift().toLowerCase();
    const Tprefix = totoro.config.prefix;

    const plugin =
      totoro.plugins.get(pluginName) ||
      totoro.plugins.find((v) => v.aliases && v.aliases.includes(pluginName));

    if (!plugin) {
      const pluginEntry = [
        ...(totoro.plugins ? totoro.plugins.keys() : []),
        ...(totoro.aliases ? totoro.aliases.keys() : []),
      ];

      const matcherx = matcher(pluginName, pluginEntry).filter(
        (v) => v.distance >= 20
      );

      if (matcherx.lentgh) {
        return noCommand(
          totoro,
          msg,
          `Totoro no encontró el comando ${pluginName}\n\n Te mostra las siguientes sugerencias:\n\n${matcherx
            .map((v) => "🐥" + Tprefix + v.string + " (" + v.accuracy + "%)")
            .join("\n")} `
        );
      }
      return;
    }

    let user = key.remoteJid;

    if (user.includes("@g.us")) user = key.participant;

    // Verificación del propietario
    if (plugin.dev && !totoro.config.dev.includes(user)) {
      return sendWarning(
        totoro,
        msg,
        "Este comando es solo para el propietario del bot."
      );
    }

    const verifyuser = require("../utils/verifyuser");
    const isVerified = await verifyuser(user, totoro, msg);

    if (
      !isVerified &&
      plugin.name !== "register" &&
      !totoro.config.dev.includes(user)
    ) {
      infoRegister(
        totoro,
        msg,
        `Para usar comandos, primero debes registrarte con el siguiente comando: ${Tprefix}register nombre.edad`
      );
      return;
    }

    plugin.execute(totoro, msg, args)?.catch((error) => {
      msg.reply(totoro.config.msg.error).then(() => {
        msg.react("❌");
      });

      console.error(error);
    });
  },
};
