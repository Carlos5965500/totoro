import axios from "axios";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  name: "playlistdownload",
  alias: ["pld"],
  description: "Descargar canciones de una playlist de Spotify",
  use: "!playlistdownload <URL de la playlist de Spotify>",
  folder: "`Descargas` 🛜",
  run: async (sock, msg, args) => {
    try {
      const input = args.join(" "); // Combina los argumentos en una sola cadena
      if (
        !input ||
        !isValidUrl(input) ||
        !input.includes("open.spotify.com/playlist/")
      ) {
        return sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Por favor, ingresa una URL válida de la playlist de Spotify.",
        });
      }

      const playlistUrl = input;
      const playlistApiUrl = `https://delirius-official.vercel.app/download/spotifyplaylist?url=${playlistUrl}`;
      const playlistResponse = await axios.get(playlistApiUrl);

      if (!playlistResponse.data.status) {
        return sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: "No se pudo obtener la información de la playlist.",
        });
      }

      const playlistData = playlistResponse.data.data;
      const tracks = playlistResponse.data.tracks;

      // Mensaje con la información de la playlist
      const playlistMessage =
        `🎵 *Nombre de la Playlist:* ${playlistData.name}\n` +
        `📝 *Descripción:* ${playlistData.description || "Sin descripción"}\n` +
        `👤 *Creador:* ${playlistResponse.data.creator}\n` +
        `👥 *Seguidores:* ${playlistData.followers}\n` +
        `🎶 *Número de Canciones:* ${tracks.length}`;

      await sock.sendMessage(msg.messages[0].key.remoteJid, {
        image: { url: playlistData.image },
        caption: playlistMessage,
      });

      // Enviar mensaje de inicio de descarga
      await sock.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Descargando canciones de la playlist: *${playlistData.name}*`,
      });

      for (const track of tracks) {
        const trackUrl = track.url;
        const downloadUrl = `https://bizarre-dacy-mecabot-0f616d28.koyeb.app/api/spotifydl?url=${trackUrl}`;

        // Informar al usuario de la canción que se está descargando
        await sock.sendMessage(msg.messages[0].key.remoteJid, {
          text: `Descargando canción: *${track.title}* de ${track.artist}`,
        });

        const response = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
        });

        if (!response.data) {
          await sock.sendMessage(msg.messages[0].key.remoteJid, {
            text: `No se pudo descargar la canción: ${track.title} de ${track.artist}.`,
          });
          continue;
        }

        const songBuffer = Buffer.from(response.data);
        const fileName = `${track.title}.mp3`;

        await sock.sendMessage(msg.messages[0].key.remoteJid, {
          document: songBuffer,
          fileName,
          caption: `🎵 ${track.title} - ${track.artist}\nAlbum: ${track.album}\nDuración: ${track.duration}\nPopularidad: ${track.popularity}`,
          mimetype: "audio/mpeg",
        });
      }

      // Mensaje de confirmación al finalizar
      await sock.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Se han descargado todas las canciones de la playlist: *${playlistData.name}*`,
      });
    } catch (error) {
      console.error(error);

      sock.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Ha ocurrido un error inesperado al descargar las canciones de la playlist de Spotify.",
      });

      sock.sendMessage(msg.messages[0].key.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
