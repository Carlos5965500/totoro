const https = require("https");

module.exports = {
  name: "yttranscribe",
  category: "utilities",
  subcategory: "audio",
  usage: "!transcribir <URL de YouTube>",
  description: "Transcribe audio de YouTube a texto.",

  async execute(totoro, msg, args) {
    const message = msg.messages && msg.messages[0];
    console.log("Mensaje recibido:", JSON.stringify(msg, null, 2));

    const remoteJid = message && message.key && message.key.remoteJid;

    if (!remoteJid) {
      console.error("remoteJid no está definido.");
      return;
    }

    const url = args[0];
    if (!url) {
      await totoro.sendMessage(remoteJid, {
        text: "🍭 *Ingrese la URL de la canción de YouTube*",
      });
      return;
    }

    const fetchTranscription = async (apiUrl, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await new Promise((resolve, reject) => {
            https
              .get(apiUrl, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                  data += chunk;
                });

                res.on("end", () => {
                  if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ json: () => JSON.parse(data) });
                  } else {
                    reject(
                      new Error(
                        `Error en la solicitud: ${res.statusCode} ${res.statusMessage}`
                      )
                    );
                  }
                });
              })
              .on("error", (err) => {
                reject(err);
              });
          });

          const res = await response.json();
          if (!res.result) {
            throw new Error("No se pudo obtener la transcripción");
          }

          return res.result;
        } catch (error) {
          console.log(
            `Error en la transcripción, intento ${attempt} de ${retries}: ${error.message}`
          );
          if (attempt === retries) {
            throw error;
          }
          console.log(`Reintentando en ${delay / 1000} segundos...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    try {
      const apiUrl = `https://cinapis.cinammon.es/youtube/index.php?url=${encodeURIComponent(url)}`;
      const transcription = await fetchTranscription(apiUrl);

      const teks =
        `╭─⬣「 *Transcripción de YouTube* 」─⬣\n` +
        `│ ≡◦ 🎶 *Transcripción*:\n` +
        `${transcription}\n` +
        `╰─⬣\n`;

      await totoro.sendMessage(remoteJid, { text: teks });
    } catch (error) {
      console.error("Error en la transcripción:", error);
      await totoro.sendMessage(remoteJid, {
        text: `╭─⬣「 *Error en la Transcripción* 」⬣\n╰─ ≡◦ *🍭 msg está experimentando un error*\n> *Error*: ${error.message}`,
      });
    }
  },
};
