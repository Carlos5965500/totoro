const {
  noCommand,
  infoRegister,
  infoPremium,
  dev,
} = require("../functions/messages");
const { totoUser, totoDev, totoCounter } = require("../models");
const { matcher } = require("../functions/matcher");
const totoroLog = require("../functions/totoroLog");
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
      !body.startsWith("+") &&
      !body.startsWith("!")
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
    const Tprefix = totoro.config.prefix;
    const plugin =
      totoro.plugins.get(pluginName) ||
      totoro.plugins.find((v) => v.aliases && v.aliases.includes(pluginName));

    if (!plugin) {
      // Asegúrate de que totoro.aliases está definido
      if (!totoro.aliases) {
        totoro.aliases = new Map();
      }

      const pluginEntry = [
        ...Array.from(totoro.plugins.keys()),
        ...Array.from(totoro.aliases.keys()),
      ];

      const matcherx = matcher(pluginName, pluginEntry).filter(
        (v) => v.accuracy >= 60
      );

      if (matcherx.length > 0) {
        return noCommand(
          msg,
          Tprefix,
          pluginName,
          `${matcherx
            .map((v) => `│  ≡◦ \`🐥 ${Tprefix}${v.string} (${v.accuracy}%)\``)
            .join("\n")}\n`
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
      return dev(
        msg,
        pluginName,
        `Este comando es exclusivo para el propietario del bot.`
      );
    }

    // Verificación de bloqueo de comandos
    if (
      plugin.blockcmd &&
      totoro.config.blockCmd.includes(plugin.name) &&
      !totoro.config.dev.includes(user)
    ) {
      return noCommand(
        msg,
        Tprefix,
        pluginName,
        `Este comando ha sido bloqueado por el propietario del bot.`
      );
    }

    const verifyuser = require("../utils/verifyuser");
    const isVerified = await verifyuser(user, totoro, msg);
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

    // cmdPremium
    const verifypremium = require("../utils/verifypremium");
    const ispremium = await verifypremium(user, totoro, msg);
    if (!ispremium && plugin.cmdPrem && !totoro.config.dev.includes(user)) {
      return infoPremium(
        msg,
        `Te invitamos a Totorolandia Premium con el comando ${Tprefix}regprem <serial>`
      );
    }

    // Incrementar el contador del comando actual si no es un desarrollador ni el teléfono específico
    const specificPhoneToExclude = "34638579630";
    const currentUser = await totoUser.findOne({
      where: {
        phone: user.split("@")[0],
      },
    });

    const devUsers = await totoDev.findAll({ attributes: ["phone"] });
    const devPhones = devUsers.map((dev) =>
      dev.phone.replace("@s.whatsapp.net", "")
    );

    if (
      currentUser &&
      !devPhones.includes(user.split("@")[0]) &&
      user.split("@")[0] !== specificPhoneToExclude
    ) {
      const counterRecord = await totoCounter.findOne({
        where: {
          totoUserId: currentUser.id,
          pluginName: plugin.name,
        },
      });

      if (counterRecord) {
        await counterRecord.increment("count");
      } else {
        await totoCounter.create({
          totoUserId: currentUser.id,
          pluginName: plugin.name,
          count: 1,
        });
      }
    }

    plugin.execute(totoro, msg, args)?.catch((error) => {
      msg
        .reply(
          `🐥 Ocurrió un error al ejecutar el comando ${pluginName} 🐥\n\n${error.message}`
        )
        .then((msg) => {
          msg.react("❌");
        });

      totoroLog.error(`Error ejecutando ${pluginName}: ${error.message}`);
      console.error(error);
    });
  },
};
