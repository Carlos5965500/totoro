const {
  noCommand,
  infoRegister,
  infoPremium,
  dev,
} = require("../functions/messages");
const {
  totoUser,
  totoDev,
  totoCounter,
  totoPremium,
  totoGroupMantainance,
} = require("../models");
const { matcher } = require("../functions/matcher");
const totoroLog = require("../functions/totoroLog");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "messages.upsert",

  async load(msg, totoro) {
    if (!msg.messages[0]?.message) return;

    if (msg.type !== "notify") return;

    //if (msg.messages[0].key?.fromMe) return;

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

    // Verificar si el usuario está en modo AFK e ignorar si es desarrollador
    await require("../plugins/set up/afk").verify(msg, body);

    //  Mencionar a Totoro solo y solo si no es un grupo con el comando "Totoro" o "Toto" o "Toto " o "@Totoro" o "@totoro"
    if (
      body.toLowerCase().includes("@Toto") ||
      body.toLowerCase().includes("@Totoro") ||
      body.toLowerCase().includes("@TotoroHelp") ||
      body.toLowerCase().includes("@TotoHelp") ||
      body.toLowerCase().includes("@Totohelp") ||
      body.toLowerCase().includes("toto") ||
      body.toLowerCase().includes("totoHelp") ||
      body.toLowerCase().includes("toto help") ||
      body.toLowerCase().includes("totohelp")
    ) {
      if (!key.remoteJid.endsWith("@g.us")) {
        const Tprefix = totoro.config.prefix;
        return msg.reply({
          text: `Hola, soy @17828280433 🐥\n\nPara ver la lista de comandos usa ${Tprefix}help`,
          mentions: ["17828280433@s.whatsapp.net"],
        });
      }
    }

    const { message } = msg.messages[0];
    const mention = message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const img = "https://i.ibb.co/j9N5kj3/image.jpg";
    //const groups = require("../models/totoGroup");
    const prefix = totoro.config.prefix;
    const plugins = await totoCounter.findAll();
    const users = await totoUser.findAll();
    const premium = await totoPremium.findAll();
    const devs = await totoDev.findAll();
    const nia = "https://wa.me/34638579630";
    //const groups = await groups.findAll();
    let media;
    try {
      media = await prepareWAMessageMedia(
        {
          image: { url: img },
        },
        { upload: totoro.waUploadToServer }
      );
    } catch (mediaError) {
      totoroLog.error(
        `Error al cargar la imagen para el mensaje de bienvenida: ${mediaError.message}`
      );
    }

    const INFO =
      `> Hola, soy @17828280433 🐥, un bot multifuncional creado por @34638579630.\n` +
      `> Puedes invitarme a tus grupos o chatear conmigo en privado. ¡Estoy aquí para ayudarte! 🐥\n` +
      `> Para invitarme a tu grupo, usa el comando ${prefix}join.\n` +
      `> Para ver la lista de comandos usa ${prefix}help.\n` +
      `*Disponemos de una versión premium con funciones exclusivas:*\n` +
      `> - ${prefix}regprem para registrarte como usuario premium\n` +
      `*Como nos gusta mejorar, puedes ayudarnos con tus sugerencias y reportes:*\n` +
      `> - ${prefix}report para reportar un error\n` +
      `> - ${prefix}review para enviar tus sugerencias\n` +
      `> - ${prefix}suggest para enviar tus sugerencias\n` +
      `*La estadististicas actuales son:*\n` +
      `> - Usuarios registrados: ${users.length}\n` +
      `> - Usuarios premium: ${premium.length}\n` +
      //`> - Grupos registrados: ${groups.length}\n` +
      `> - Plugins ejecutados: ${plugins.length}\n` +
      `> - Desarrolladores: ${devs.length}\n` +
      `> - Versión: 2.0.0\n` +
      `> - Última actualización: ${new Date().toLocaleDateString()}\n` +
      `> - Creado por: @34638579630\n`;

    const messageOptions = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage,
            },
            body: { text: INFO },
            footer: { text: `@17828280433` },
            buttons: [
              {
                name: "cta_url",
                buttonParamsJSON: JSON.stringify({
                  display_text: "Totoro 💬",
                  url: totoro,
                  merchat_url: totoro,
                }),
              },

              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Contacto 📩",
                  url: nia,
                  merchant_url: nia,
                  mentions: JSON.stringify({ id: "34638579630" }),
                }),
              },
            ],
            messageParamsJson: "",
          },
        },
      },
    };

    const from = msg.messages[0].key.remoteJid;
    const info = msg.messages[0];

    // mencionar a Totoro solo y solo si es un grupo
    if (mention && mention[0]?.match(/17828280433/g)) {
      await totoro.relayMessage(
        from,
        { viewOnceMessage: { message: messageOptions } },
        { quoted: info }
      );
    }

    if (
      !body.startsWith("+") &&
      !body.startsWith("!") &&
      !body.startsWith(",")
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

    const totoStatus = require("../models/totoStatus");
    const totoMantainance = require("../models/totoMantainance");
    const totoBlock = require("../models/totoBlock");

    const isGroupMessage = key.remoteJid.endsWith("@g.us");
    const userJid = key.remoteJid.includes("@g.us")
      ? key.participant
      : key.remoteJid;
    const participant = userJid.split("@")[0];

    // verificar si el bot está activo o no
    const status = await totoStatus.findOne({ where: { statusId: 1 } });
    if (
      status &&
      status.status === "off" &&
      !totoro.config.dev.includes(userJid)
    ) {
      msg.reply({
        text:
          `╭─⬣「 Totoro desactivado 」\n` +
          `│ ≡◦ Aguarda, esto lleverá un tiempo.\n` +
          `│ ≡◦ Disculpa las molestias.\n` +
          `│ ≡◦ Para más información, contacta a @34638579630\n` +
          `╰─⬣\n` +
          `> @${participant}, el bot está desactivado. Inténtalo más tarde.`,
        mentions: [userJid, "34638579630@s.whatsapp.net"],
      });
      return;
    }

    // verificar si el bot está en mantenimiento
    const maintenance = await totoMantainance.findOne({
      where: { maintenanceId: 1 },
    });
    if (
      maintenance &&
      maintenance.status === "on" &&
      !totoro.config.dev.includes(userJid)
    ) {
      msg.reply({
        text:
          `╭─⬣「 Totoro en mantenimiento 」\n` +
          `│ ≡◦ Aguarda, esto lleverá un tiempo.\n` +
          `│ ≡◦ Disculpa las molestias.\n` +
          `│ ≡◦ Para más información, contacta a @34638579630\n` +
          `╰─⬣\n` +
          `> @${participant}, el bot está en mantenimiento. Inténtalo más tarde.`,
        mentions: [userJid, "34638579630@s.whatsapp.net"],
      });
      return;
    }

    // verificar si el bot está bloqueado en el grupo actual y sin bloquear a todo el bot
    if (isGroupMessage) {
      const groupId = key.remoteJid;
      const block = await totoBlock.findOne({ where: { groupId } });

      if (
        block &&
        block.status === "on" &&
        !totoro.config.dev.includes(userJid) &&
        !groupId.includes("@broadcast")
      ) {
        msg.reply({
          text:
            `╭─⬣「 Totoro bloqueado 」\n` +
            `│ ≡◦ Totoro ha sido bloqueado en este ${isGroupMessage ? "grupo" : "chat"}.\n` +
            `│ ≡◦ Disculpa las molestias.\n` +
            `│ ≡◦ Los administradores pueden desbloquear el bot.\n` +
            `│ ≡◦ Para más información, contacta a @34638579630\n` +
            `╰─⬣\n` +
            `> @${participant}, el bot está bloqueado en este grupo. Inténtalo más tarde.`,
          mentions: [userJid, "34638579630@s.whatsapp.net"],
        });
        return;
      }

      const groupMantainance = await totoGroupMantainance.findOne({
        where: { groupId },
      });

      if (
        groupMantainance &&
        groupMantainance.status === "on" &&
        !totoro.config.dev.includes(userJid)
      ) {
        msg.reply({
          text:
            `╭─⬣「 ${isGroupMessage ? "Grupo" : "Chat"} en mantenimiento 」\n` +
            `│ ≡◦ Totoro está en mantenimiento en este ${isGroupMessage ? "grupo" : "chat"}.\n` +
            `│ ≡◦ Disculpa las molestias.\n` +
            `│ ≡◦ Para más información, contacta a @34638579630\n` +
            `╰─⬣\n` +
            `> @${participant}, el bot está en mantenimiento. Inténtalo más tarde.`,
          mentions: [userJid, "34638579630.s.whatsapp.net"],
        });
        return;
      }
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
    const totoCounterActivate = require("../models/totoCounterActivate");
    const devPhones = devUsers.map((dev) =>
      dev.phone.replace("@s.whatsapp.net", "")
    );

    const activateCounter = await totoCounterActivate.findOne({
      where: { counterId: 1 },
    });

    if (
      !currentUser ||
      !activateCounter ||
      activateCounter.status !== "on" ||
      devPhones.includes(user.split("@")[0]) ||
      user.split("@")[0] === specificPhoneToExclude
    ) {
      return plugin.execute(totoro, msg, args);
    } else {
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
          `🐥 Ocurrió un error al ejecutar el comando *${pluginName}* 🐥\n\n> ${error.message}`
        )
        .then((msg) => {
          msg.react("❌");
        });

      totoroLog.error(
        "./logs/events/messages.upsert.log",
        `Error ejecutando ${pluginName}: ${error.message}`
      );
      console.error(error);
    });
  },
};
