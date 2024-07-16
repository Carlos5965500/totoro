import fs from "fs";
import ytSearch from "yt-search";
import path from "path";
import ytdl from "@distube/ytdl-core";
import nodeid3 from "node-id3";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";

const fetchWithRetry = async (url, options, retries = 3, backoff = 3000) => {
  try {
    return await axios.get(url, options);
  } catch (error) {
    if (retries === 0 || error.response.status !== 403) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
};

export default {
  name: "play",
  description: "Descarga canciones de Youtube.",
  alias: ["reproduce", "p", "cancion", "musica", "youtube", "canción"],
  use: "!play 'nombre o url'",
  folder: "`Descargas` 🛜",

  run: async (socket, msg, args) => {
    try {
      const name = args.join(" ");

      if (!name) {
        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Ingresa el nombre de la canción.",
        });
      }

      const output = path.resolve("src", "temp", `SONG${Date.now()}.mp3`);

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });

      const video = (await ytSearch(name)).all.find((i) => i.type === "video");

      if (!video) {
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "Sin resultados.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      if (video.seconds > 1200) {
        await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          text: "El vídeo no debe superar los 20 minutos.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      try {
        const stream = ytdl(video.url, {
          filter: "audioonly",
          quality: "highestaudio",
          requestOptions: {
            headers: {
              Cookie: "VISITOR_INFO1_LIVE=...",
              "x-youtube-client-name": "1",
              "x-youtube-client-version": "2.20210721.00.00",
            },
          },
        });

        await new Promise((resolve, reject) => {
          ffmpeg(stream)
            .audioBitrate(64)
            .on("end", resolve)
            .on("error", reject)
            .save(output);
        });

        const { data } = await fetchWithRetry(video.image || video.thumbnail, {
          responseType: "arraybuffer",
        });

        const tags = {
          title: video.title,
          artist: video.author?.name,
          image: {
            imageBuffer: data,
          },
        };

        const success = nodeid3.update(tags, output);

        if (success) {
          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            image: { url: video.image },
            caption: `*${video.title}*\n\n*Autor:* ${video.author.name}\n*Duración:* ${video.timestamp}\n*Vistas:* ${video.views}`,
          });

          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            audio: { url: output },
            mimetype: "audio/mpeg",
          });

          socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            react: { text: "✅", key: msg.messages[0]?.key },
          });

          fs.promises.unlink(output);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
            text: "No tienes permiso para acceder a este recurso.",
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        text: `¡Ups! Sucedió un error: ${error.message}`,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
