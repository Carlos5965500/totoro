const { downloader } = require("scrape-websitee");
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "tkmp4",
  category: "multimedia",
  subcategory: "tiktok",
  usage: "tkmp4 <enlace | nombre>",
  description: "Descarga video de TikTok",
  dev: false,
  blockcmd: true,
  cmdPrem: false,
  async execute(totoro, msg, args) {
    msg.react("⏳");
    const message = msg.messages[0];
    const remoteJid = message.key.remoteJid;

    // Si no hay argumentos, usar texto del mensaje citado
    let url =
      args[0] ||
      message.message.extendedTextMessage?.contextInfo?.quotedMessage
        ?.audioMessage?.url;

    if (!url) {
      return help(
        totoro,
        msg,
        "tkmp4",
        "Descarga video de TikTok",
        "tkmp4 <enlace | nombre>"
      );
    }

    const tkRegExp = /tiktok/;

    // Validar que la URL sea de TikTok
    if (!tkRegExp.test(url)) {
      return sendWarning(
        totoro,
        msg,
        "*🚩 Asegúrate de ingresar una URL válida de TikTok*"
      );
    }

    try {
      // Obtener el enlace de descarga de TikTok
      const res = await downloader.tiktokdl2(url);

      // Verificar la respuesta
      if (res.status === true) {
        if (res.type === "video") {
          const dl_url = res.video.server1; // URL del video

          let txt = `╭─⬣「 *TikTok Video Download* 」⬣\n`;
          txt += `│  ≡◦ *🍭 Enlace ∙* ${url}\n`;
          txt += `╰─⬣`;

          // Enviar el mensaje de video
          await totoro.sendMessage(
            remoteJid,
            {
              video: { url: dl_url },
              caption: txt,
            },
            { quoted: message } // Permitir enviar por mensaje citado
          );
        } else if (res.type === "image") {
          // Enviar cada imagen descargada
          for (const image of res.images) {
            await totoro.sendMessage(
              remoteJid,
              {
                image: { url: image },
                caption: `Descarga de imagen de TikTok`,
              },
              { quoted: message }
            );
          }
        }
      } else {
        return sendWarning(
          totoro,
          msg,
          "*🏮 Ocurrió un error en la descarga :/*"
        );
      }
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/multimedia/tkmp4.js",
        `Error al descargar el video de TikTok: ${error}`
      );
      sendError(
        totoro,
        msg,
        "Error al descargar el video de TikTok. Por favor, vuelve a intentarlo."
      );
    }
  },
};
