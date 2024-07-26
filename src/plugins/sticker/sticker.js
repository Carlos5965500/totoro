module.exports = {
  name: "sticker",
  description: "Convertir una imagen en un sticker.",
  category: "util",
  subcategory: "media",
  usage: "<sticker>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: ["ATTACH_FILES"],
  dev: false,
  blockcmd: true,
  async execute(totoro, msg) {
    try {
      // Descargar el medio
      const media = await msg.downloadMedia();

      // Verificar que el medio sea una imagen
      if (!media || !media.mimetype.startsWith("image/")) {
        throw new Error("Tipo de medio no válido. Solo se permiten imágenes.");
      }

      // Crear el sticker
      const sticker = await totoro.sticker(media, { type: "full" });

      // Enviar el sticker
      await totoro.sendMessage(msg.key.remoteJid, sticker, "stickerMessage", {
        quoted: msg,
      });
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(
        msg.key.remoteJid,
        `Totoro no pudo convertir la imagen en un sticker. Error: ${error.message}`
      );
    }
  },
};
