const axios = require("axios");
const { help, sendError } = require("../../functions/messages");

module.exports = {
  name: "tikuser",
  aliases: ["tiktokuser"],
  category: "information",
  subcategory: "user",
  description: "Obtener información de un usuario de TikTok.",
  usage: "tikuser <nombre de usuario>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,
  dev: false,
  blockcmd: true,
  async execute(totoro, msg, args) {
    try {
      // Verificar si se proporcionó un nombre de usuario
      if (!args[0]) {
        return help(
          totoro,
          msg,
          "TikTok User",
          "Obtener información de un usuario de TikTok.",
          `+tikuser <nombre de usuario>`
        );
      }

      // Eliminar el "@" del nombre de usuario si está presente
      const username = args[0].replace("@", "");

      // Construir la URL de la API con el nombre de usuario codificado
      const apiUrl = `https://cinapis.cinammon.es/rrss/tiktok/index.php?username=${encodeURIComponent(username)}`;

      // Realizar la solicitud GET a la API
      const response = await axios.get(apiUrl);

      // Verificar si la solicitud fue exitosa
      if (response.status !== 200) {
        return sendError(
          totoro,
          msg,
          "No se pudo obtener la información del usuario de TikTok."
        );
      }

      // Obtener los datos del usuario de la respuesta
      const data = response.data;

      // Verificar si se obtuvieron datos válidos
      if (!data || data.error) {
        return sendError(
          totoro,
          msg,
          "No se pudo obtener la información del usuario de TikTok."
        );
      }

      // Extraer los campos relevantes de los datos
      const {
        avatar,
        nickname,
        bio,
        region,
        followers,
        following,
        likes,
        videos,
        views,
        isBusiness,
        verified,
      } = data;

      // Construir el mensaje de respuesta con la información del usuario
      let txt = `
╭┈ ↷
│ ✐; *T I K T O K  -  U S E R  I N F O*
│ ┆ ✐;  *Usuario:* ${username}
│ ┆ ✐;  *Nombre:* ${nickname}
│ ┆ ✐;  *Biografía:* ${bio}
│ ┆ ✐;  *Región:* ${region}
│ ┆ ✐;  *Seguidores:* ${followers}
│ ┆ ✐;  *Siguiendo:* ${following}
│ ┆ ✐;  *Me gusta:* ${likes}
│ ┆ ✐;  *Videos:* ${videos}
│ ┆ ✐;  *Vistas:* ${views}
│ ┆ ✐;  *Cuenta de empresa:* ${isBusiness ? "🍭" : "🐥"}
│ ┆ ✐;  *Verificado:* ${verified ? "🍭" : "🐥"}
╰─────────────────────┈`;

      // Enviar el mensaje de respuesta al canal de Discord
      await msg.reply(txt);

      // Si hay un avatar, enviarlo como archivo adjunto
      if (avatar) {
        await totoro.sendMessage(msg.from, {
          url: avatar,
          filename: "avatar.jpg",
          caption: `${txt}`,
        });
      } else {
        return sendError(
          totoro,
          msg,
          "No se pudo obtener la imagen de perfil del usuario de TikTok."
        );
      }
    } catch (error) {
      console.log(error);
      return sendError(
        totoro,
        msg,
        "Ocurrió un error al obtener la información del usuario de TikTok."
      );
    }
  },
};
