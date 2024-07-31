const ytdl = require("ytdl-core");
const youtubeSearch = require("youtube-search-api");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { sendWarning, sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "youtube",
  category: "multimedia",
  subcategory: "youtube",
  usage: "youtube <enlace o término de búsqueda>",
  description: "Descarga video de YouTube.",
  example: "youtube https://www.youtube.com/watch?v=dQw4w9WgXcQ o youtube amor",
  dev: false,
  blockcmd: true,
  cmdPrem: false,
  async execute(totoro, msg, args) {
    try {
      msg.react("⏳");

      if (!args[0]) {
        return sendWarning(
          totoro,
          msg,
          "Por favor, proporciona una URL de YouTube o un término de búsqueda."
        );
      }

      let videoUrl;
      if (ytdl.validateURL(args[0])) {
        videoUrl = args[0];
      } else {
        videoUrl = await getYoutubeVideoUrlFromSearch(args.join(" "));
        if (!videoUrl) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }
      }

      const dl_url = await getYoutubeDownloadUrl(videoUrl);
      if (!dl_url) {
        return sendWarning(
          totoro,
          msg,
          "No se pudo obtener el enlace de descarga."
        );
      }

      const user = msg.messages[0]?.pushName || ".";
      const content = `Solicitada por ${user}`;
      const { imageMessage } = await prepareWAMessageMedia(
        { image: { url: "https://i.ibb.co/j9N5kj3/image.jpg" } },
        { upload: totoro.waUploadToServer }
      );

      const message = createInteractiveMessage(
        content,
        imageMessage,
        dl_url,
        videoUrl
      );

      await totoro.relayMessage(
        msg.messages[0].key.remoteJid,
        { viewOnceMessage: { message } },
        { quoted: msg.messages[0] }
      );
      await msg.react("📽️");
    } catch (error) {
      totoroLog.info(
        "./logs/plugins/multimedia/youtube.log",
        `Error: ${error.message}`
      );
      return sendError(totoro, msg, "Hubo un error al procesar tu solicitud.");
    }
  },
};

async function getYoutubeVideoUrlFromSearch(query) {
  try {
    const searchResults = await youtubeSearch.GetListByKeyword(query, false, 1);
    if (searchResults.items.length === 0) {
      return null;
    }
    return `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
  } catch (error) {
    throw new Error(
      `Error al realizar la búsqueda en YouTube: ${error.message}`
    );
  }
}

async function getYoutubeDownloadUrl(videoUrl) {
  try {
    const info = await ytdl.getInfo(videoUrl);
    return ytdl.chooseFormat(info.formats, { quality: "highestvideo" }).url;
  } catch (error) {
    throw new Error(`Error al obtener el enlace de descarga: ${error.message}`);
  }
}

function createInteractiveMessage(content, imageMessage, dl_url, videoUrl) {
  return {
    interactiveMessage: {
      header: { hasMediaAttachment: true, imageMessage: imageMessage },
      body: { text: content },
      footer: { text: `Descargado por Totoro` },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: `Open in YouTube 📲`,
              url: videoUrl,
            }),
          },
        ],
        messageParamsJson: "",
      },
    },
  };
}
