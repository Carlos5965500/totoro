const scdl = require("soundcloud-downloader").default;
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "SoundCloud",
  category: "multimedia",
  subcategory: "Sound Cloud",
  description: "Descarga audios de SoundCloud.",
  usage: "sc < url o nombre>",
  aliases: ["asc", "sca", "scmp3", "sc", "scaudio", "play", "totorosc", "tsc"],
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,
  dev: false,
  blockcmd: true,
  cmdPrem: true,
  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!participant && !remoteJid) {
      return sendError(
        totoro,
        msg,
        "No se pudo obtener el número del usuario o el chat."
      );
    }

    if (!args[0]) {
      return help(
        totoro,
        msg,
        "scmp3",
        "Descarga audios de SoundCloud.",
        "scmp3 <sc url o nombre>"
      );
    }

    try {
      let trackUrl = args[0];

      if (
        !trackUrl.match(/soundcloud\.com/) &&
        !trackUrl.match(/api\.soundcloud\.com/)
      ) {
        const searchResults = await scdl.search({
          query: trackUrl,
          resourceType: "tracks",
        });

        if (
          !searchResults ||
          !searchResults.collection ||
          !searchResults.collection.length
        ) {
          throw new Error("No se encontraron resultados para la búsqueda.");
        }

        trackUrl = searchResults.collection[0].permalink_url;

        if (!trackUrl) {
          throw new Error("No se pudo obtener el URL de la pista.");
        }
      }

      await msg.react("⏳");

      const trackInfo = await scdl.getInfo(trackUrl);
      if (!trackInfo || typeof trackInfo !== "object") {
        throw new Error("No se pudo obtener la información de la pista.");
      }

      const { title, duration, artwork_url } = trackInfo;

      // Obtener URL de alta resolución de la miniatura si está disponible
      const highResArtworkUrl = artwork_url
        ? artwork_url.replace("-large", "-t500x500")
        : null;

      const downloadStream = await scdl.download(trackUrl);
      if (!downloadStream) {
        throw new Error("No se pudo obtener el URL de descarga.");
      }

      // Convertir el stream a un buffer para poder enviarlo directamente
      const audioBuffer = await streamToBuffer(downloadStream);
      const fileSizeMB = audioBuffer.length / (1024 * 1024); // Convertir bytes a megabytes

      if (fileSizeMB > 100) {
        return sendWarning(
          totoro,
          msg,
          "El archivo pesa más de 100 MB, se canceló la descarga."
        );
      }

      let metadata = `Título: ${title}\nDuración: ${(duration / 1000).toFixed(2)}s\nPeso: ${fileSizeMB.toFixed(2)} MB`;

      // Enviar mensaje con la miniatura y la información
      if (highResArtworkUrl) {
        await totoro.sendMessage(
          remoteJid || participant,
          {
            image: { url: highResArtworkUrl },
            caption: metadata,
          },
          { quoted: msg.messages[0] }
        );
      } else {
        await totoro.sendMessage(
          remoteJid || participant,
          {
            text: metadata,
          },
          { quoted: msg.messages[0] }
        );
      }

      // Enviar mensaje con el audio
      await totoro.sendMessage(
        remoteJid || participant,
        {
          audio: audioBuffer, // Enviar el buffer de audio
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: msg.messages[0], asDocument: true }
      );

      await msg.react("🔊");
    } catch (error) {
      await sendError(totoro, msg, `${error.message}`);
    }
  },
};

// Función para convertir un stream a un buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
