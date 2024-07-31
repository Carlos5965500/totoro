const {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const axios = require("axios");
const { sendWarning, sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;

// Tu API Key de Last.fm
const API_KEY = "e01e990f45fcb65869a9a7bf757547d9";

module.exports = {
  name: "lastfm",
  aliases: ["lfm"],
  category: "information",
  subcategory: "music",
  usage: `${prefix}lastfm <artista|álbum|canción> <nombre>`,
  example: `${prefix}lastfm artista Coldplay`,
  description: "Obten información de un artista, álbum o canción en Last.fm",

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const from = info.key.remoteJid;

    await msg.react("🔍");

    // Verifica si se proporciona el tipo de búsqueda y el término de búsqueda
    const type = args[0]; // 'artista', 'álbum', o 'canción'
    const term = args.slice(1).join(" ");
    if (!type || !term) {
      help(
        totoro,
        msg,
        "Last.fm",
        "Obten información de un artista, álbum o canción en Last.fm.",
        `${prefix}lastfm artista Coldplay\n${prefix}lastfm álbum Moon Music Coldplay\n${prefix}lastfm canción Yellow Coldplay`
      );
      return; // Salir de la función si faltan parámetros
    }

    try {
      let data;

      // Decide el tipo de búsqueda y realiza la solicitud a Last.fm
      if (type.toLowerCase() === "artista") {
        data = await fetchLastFMData("artist.getinfo", { artist: term });
      } else if (type.toLowerCase() === "álbum") {
        const artist = args[2];
        if (!artist) {
          sendWarning(
            totoro,
            msg,
            "Last.fm",
            "Por favor proporciona el nombre del artista."
          );
          return; // Salir si falta el artista
        }
        data = await fetchLastFMData("album.getinfo", { album: term, artist });
      } else if (type.toLowerCase() === "canción") {
        const artist = args[2];
        if (!artist) {
          sendWarning(
            totoro,
            msg,
            "Last.fm",
            "Por favor proporciona el nombre del artista."
          );
          return; // Salir si falta el artista
        }
        data = await fetchLastFMData("track.getinfo", { track: term, artist });
      } else {
        sendWarning(
          totoro,
          msg,
          "Last.fm",
          "Tipo de búsqueda inválido. Usa: artista, álbum o canción."
        );
        return; // Salir si el tipo de búsqueda no es válido
      }

      // Procesa la respuesta de Last.fm
      if (data.error) {
        sendWarning(
          totoro,
          msg,
          "Last.fm",
          `No se encontró información para "${term}".`
        );
        return; // Salir si hay un error en la respuesta
      }

      // Formatea la información del artista, álbum o canción
      const result =
        type.toLowerCase() === "artista"
          ? formatArtistInfo(data.artist)
          : type.toLowerCase() === "álbum"
            ? formatAlbumInfo(data.album)
            : type.toLowerCase() === "canción"
              ? formatTrackInfo(data.track)
              : "";

      // Prepara la imagen de perfil si existe
      const imgUrl =
        type.toLowerCase() === "artista"
          ? data.artist.image[3]["#text"]
          : type.toLowerCase() === "álbum"
            ? data.album.image[3]["#text"]
            : type.toLowerCase() === "canción"
              ? data.track.image[3]["#text"]
              : "";

      const img = imgUrl
        ? await prepareWAMessageMedia(
            { image: { url: imgUrl } },
            { upload: totoro.waUploadToServer }
          )
        : null;

      // Crea el mensaje interactivo
      const interactiveMessage = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { text: `\`Last.fm Info 👀\`` },
              body: { text: result },
              footer: { text: "lastfm by Totoro 🪼" },
              header: {
                hasMediaAttachment: !!img,
                imageMessage: img ? img.imageMessage : undefined,
              },
            },
          },
        },
      };

      const msag = generateWAMessageFromContent(from, interactiveMessage, {
        userJid: info.remoteJid,
        quoted: info,
      });

      await totoro.relayMessage(from, msag.message, {
        messageId: info.id,
      });

      await msg.react("✅");
    } catch (err) {
      totoroLog.error(
        "./logs/plugins/information/lastfm.log",
        `Error al buscar "${term}": ${err.message}, Stack: ${err.stack}`
      );
      sendError(
        totoro,
        msg,
        "Last.fm",
        `Ocurrió un error al buscar "${term}": ${err.message}`
      );
    }
  },
};

// Función para realizar la solicitud a Last.fm
async function fetchLastFMData(method, params) {
  const url = "https://ws.audioscrobbler.com/2.0/";
  params.api_key = API_KEY;
  params.format = "json";
  params.method = method;

  const response = await axios.get(url, { params });
  return response.data;
}

// Formatea la información del artista
function formatArtistInfo(artist) {
  return (
    `✦ *Artista:* ${artist.name}\n` +
    `✦ *Seguidores:* ${artist.stats.usercount}\n` +
    `✦ *Biografía:* ${artist.bio.summary}`
  );
}

// Formatea la información del álbum
function formatAlbumInfo(album) {
  return (
    `✦ *Álbum:* ${album.title}\n` +
    `✦ *Artista:* ${album.artist}\n` +
    `✦ *Año de lanzamiento:* ${album.release}\n` +
    `✦ *Número de pistas:* ${album.tracks.track.length}`
  );
}

// Formatea la información de la canción
function formatTrackInfo(track) {
  return (
    `✦ *Canción:* ${track.name}\n` +
    `✦ *Artista:* ${track.artist.name}\n` +
    `✦ *Álbum:* ${track.album.title}\n` +
    `✦ *Duración:* ${Math.floor(track.duration / 1000)} segundos`
  );
}
