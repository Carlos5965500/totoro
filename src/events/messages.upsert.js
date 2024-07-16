const {
  sendWarning,
  noCommand,
  infoRegister,
  infoPremium,
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

      let user = key.remoteJid;
      const Tprefix = totoro.config.prefix;
      const verifypremium = require("../utils/verifypremium");
      const ispremium = await verifypremium(user, totoro, msg);
      if (!ispremium && !totoro.config.dev.includes(user)) {
        return infoPremium(
          msg,
          `Te invitamos a Totorolandia Premium con el comando ${Tprefix}regprem <serial>`
        );
      }

      const { chatAI } = require("../utils/chatAI");

      await totoro.sendPresenceUpdate("composing", key.remoteJid);

      const response = await chatAI(totoro, body);

      return msg.reply(response);
    }

    const args = body.slice(1).trim().split(/\s+/);
    const pluginName = args.shift().toLowerCase();

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

      if (matcherx.length) {
        return noCommand(
          totoro,
          msg,
          `Totoro no encontró el comando ${pluginName}\n\n Te mostra las siguientes sugerencias:\n\n${matcherx
            .map((v) => "🐥" + Tprefix + v.string + " (" + v.accuracy + "%)")
            .join("\n")} `
        );
      }
    }
    if (!plugin) {
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
    const Tprefix = totoro.config.prefix;
    if (
      !isVerified &&
      plugin.name !== "register" &&
      !totoro.config.dev.includes(user)
    ) {
      return infoRegister(
        msg,
        `Te invitamos Totorolandia con ${Tprefix}register <nombre>.<edad>`
      );
    }

    plugin.execute(totoro, msg, args)?.catch((error) => {
      msg
        .reply(
          `🐥 Ocurrió un error al ejecutar el comando ${pluginName} 🐥\n\n${error.message}`
        )
        .then((msg) => {
          msg.react("❌");
        });

      console.error(error);
    });
  },
};
