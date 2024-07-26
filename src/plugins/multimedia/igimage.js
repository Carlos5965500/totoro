const Scraper = require("@SumiFX/Scraper");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const { tr } = require("../../../data/languages");

module.exports = {
  name: "igimage",
  category: "multimedia",
  subcategory: "instagram",
  usage: "instagram <enlace>",
  description: "Descarga imagen de Instagram.",
  example: "instagram https://www.instagram.com/p/CS8X3v3L6WV/",
  dev: false,
  blockcmd: true,
  cmdPrem: true,


  async execute(totoro, msg, args) {
    msg.react("⏳");
    let { dl_url } = await Scraper.igdl(args[0]);
    if (!dl_url) {
      totoroLog.info(
        "./logs/plugins/multimedia/igmp4.log",
        "Error al obtener el enlace de descarga."
      );
      return sendWarning(
        totoro,
        msg,
        "No se pudo obtener el enlace de descarga."
      );
    }

    if (!dl_url.match(/.jpg|.jpeg|.png/gi)) {
      totoroLog.info(
        "./logs/plugins/multimedia/igmp4.log",
        "Enlace de descarga de imagen obtenido."
      );
      return sendWarning(totoro, msg, `Solo se pueden descargar imágenes.`);
    }

    const user = msg.messages[0]?.pushName || ".";
    const content = `Solicitada por ${user}`;

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: dl_url },
      },
      { upload: totoro.waUploadToServer }
    );

    const message = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: `Descargado por Totoro` },
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: `Open in Instagram 📲`,
                url: args[0],
              }),
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: `Download Image`,
                id: `sendimage+${dl_url}`,
              }),
            },
          ],
          messageParamsJson: "",
        },
      },
    };

    await totoro.relayMessage(
      msg.messages[0].key.remoteJid,
      { viewOnceMessage: { message } },
      {
        quoted: msg.messages[0],
      }
    );

    await msg.react("🖼️");
  },
};
