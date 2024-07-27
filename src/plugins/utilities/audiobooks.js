const https = require("https");
const {
  sendWarning,
  sendError,
  sendMessage,
  help,
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
      return help(
        totoro,
        msg,
        "audiobook",
        "Descarga un audiolibro gratuito.",
        "audiobook El principito"
      );
    }

    const bookName = args.join(" ");
    try {
      const bookInfo = await getAudiobookInfo(bookName);

      if (!bookInfo) {
        return sendWarning(
          totoro,
          msg,
          `No se encontró un audiolibro con el nombre *${bookName}*`
        );
      }

      let responseMessage = `Audiolibro encontrado:\n\n`;
      responseMessage += `Título: ${bookInfo.title}\n`;
      responseMessage += `Autor: ${bookInfo.author_name ? bookInfo.author_name.join(", ") : "Desconocido"}\n`;
      responseMessage += `Enlace de descarga: ${bookInfo.download_link}\n`;

      await sendMessage(totoro, msg, responseMessage);
    } catch (error) {
      console.error("Error retrieving audiobook information:", error);
      sendWarning(totoro, msg, `${error.message}`);
      await sendError(totoro, msg, `${error.message}`);
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
