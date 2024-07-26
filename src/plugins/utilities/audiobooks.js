const https = require("https");
const {
  sendWarning,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "audiobook",
  aliases: ["abook"],
  description: "Descarga un audiolibro gratuito.",
  category: "utilities",
  subcategory: "audiobooks",
  usage: `audiobook <nombre del libro>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  dev: false,
  blockcmd: true,
  execute: async (totoro, msg, args) => {
    if (!args.length) {
      return sendWarning(
        totoro,
        msg,
        "Por favor, proporciona el nombre de un audiolibro."
      );
    }

    const bookName = args.join(" ");
    try {
      const bookInfo = await getAudiobookInfo(bookName);

      if (!bookInfo) {
        const warningMessage = `\n> No se pudo encontrar el audiolibro solicitado.`;
        return sendWarning(totoro, msg, warningMessage);
      }

      let responseMessage = `Audiolibro encontrado:\n\n`;
      responseMessage += `Título: ${bookInfo.title}\n`;
      responseMessage += `Autor: ${bookInfo.author_name ? bookInfo.author_name.join(", ") : "Desconocido"}\n`;
      responseMessage += `Enlace de descarga: ${bookInfo.download_link}\n`;

      await sendMessage(totoro, msg, responseMessage);
    } catch (error) {
      console.error("Error retrieving audiobook information:", error);
      const errorMessage = `╭─⬣「 *Advertencia* 」⬣\n│  ≡◦ *⚠️ Totoro te advierte lo siguiente:*\n╰─⬣\n> ${error.message}`;
      await sendError(totoro, msg, errorMessage);
    }
  },
};

function getAudiobookInfo(bookName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "openlibrary.org",
      path: `/search.json?title=${encodeURIComponent(bookName)}`,
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          const book = result.docs.find((doc) => doc.has_fulltext && doc.ocaid);
          resolve(book);
        } else {
          reject(new Error(res.statusCode));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}
