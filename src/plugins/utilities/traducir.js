const { translate } = require("@vitalets/google-translate-api");
const {
  sendWarning,
  sendError,
  sendMessage,
} = require("../../functions/messages");
const idiomas = require("../../../data/languages");

const cache = new Map();

module.exports = {
  name: "translate",
  aliases: ["tr"],
  description: "Traduce un mensaje citado a un idioma especificado.",
  category: "utility",
  subcategory: "tools",
  usage: `translate <código_idioma>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],

  execute: async (totoro, msg, args) => {
    try {
      if (args.length < 1) {
        await sendWarning(
          totoro,
          msg,
          "Uso incorrecto. Ejemplo de uso: `translate es`"
        );
        return;
      }

      const targetLang = args[0];

      // Validar si hay un mensaje citado
      const quotedMessage =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        await sendMessage(
          totoro,
          msg,
          `Por favor, cita el mensaje que deseas traducir.`
        );
        return;
      }

      const textToTranslate =
        quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;

      if (!textToTranslate) {
        await sendWarning(
          totoro,
          msg,
          "No se pudo determinar el texto a traducir. Asegúrate de citar el mensaje correctamente."
        );
        return;
      }

      // Verificar si el mensaje ya contiene una traducción
      const translationMarker = "> 🌐 Traducción a";
      if (textToTranslate.includes(translationMarker)) {
        await sendWarning(
          totoro,
          msg,
          "Este mensaje ya ha sido traducido anteriormente."
        );
        return;
      }

      // Verificar si la traducción está en caché
      const cacheKey = `${textToTranslate}_${targetLang}`;
      if (cache.has(cacheKey)) {
        const cachedTranslation = cache.get(cacheKey);
        cache.delete(cacheKey); // Borrar la caché después de usarla
        await msg.reply(
          `${cachedTranslation}\n\n> 🌐 Traducción a ${idiomas[targetLang.toLowerCase()] || targetLang}`
        );
        return;
      }

      // Llamar a la API de traducción con reintentos
      const translatedText = await translateWithRetry(
        textToTranslate,
        targetLang
      );

      const targetLangName = idiomas[targetLang.toLowerCase()] || targetLang;

      // Guardar la traducción en caché y luego borrarla
      cache.set(cacheKey, translatedText);
      cache.delete(cacheKey);

      await msg.reply(
        `${translatedText}\n\n> 🌐 Traducción a ${targetLangName}`
      );
    } catch (error) {
      console.error("Error during translation:", error);
      await sendError(totoro, msg, error.message);
    }
  },
};

async function translateWithRetry(text, targetLang, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await translate(text, { to: targetLang });
      return result.text;
    } catch (error) {
      if (error.message.includes("Too Many Requests")) {
        if (attempt < retries) {
          // Esperar 1 segundo antes de reintentar
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw new Error(
            "El servicio de traducción ha recibido demasiadas solicitudes. Por favor, intenta de nuevo más tarde."
          );
        }
      } else {
        throw error;
      }
    }
  }
}
