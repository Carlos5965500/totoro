const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const ffmpeg = require("fluent-ffmpeg");
const { tmpdir } = require("os");
const { join } = require("path");
const { writeFileSync, unlinkSync, readFileSync } = require("fs");
const { sendWarning } = require("../../functions/messages");

module.exports = {
  name: "sticker",
  aliases: ["sticker", "s"],
  category: "media",
  subcategory: "sticker",
  description:
    "Crea un sticker a partir de una imagen o video, o convierte un sticker a una imagen o video.",
  usage: `sticker`,
  cmdPrem: false,
  dev: false,
  blockcmd: false,

  async execute(totoro, msg) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    await msg.react("🧩");
    const isQuotedImage =
      !!info.message?.imageMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.imageMessage;
    const isQuotedVideo =
      !!info.message?.videoMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.videoMessage;
    const isQuotedSticker =
      !!info.message?.stickerMessage ||
      !!info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.stickerMessage;

    try {
      if (!isQuotedImage && !isQuotedVideo && !isQuotedSticker) {
        return reply("*🚩 Etiqueta una imagen, video o sticker*");
      }

      let buffer = Buffer.from([]);
      if (isQuotedImage) {
        const stream = await downloadContentFromMessage(
          info.message?.imageMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.imageMessage,
          "image"
        );
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
      } else if (isQuotedVideo) {
        if (
          info.message?.videoMessage?.seconds > 10 ||
          info.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage?.seconds > 10
        ) {
          return sendWarning(
            totoro,
            from,
            "*🚩 El video debe durar menos de 10 segundos*",
            info
          );
        }
        const stream = await downloadContentFromMessage(
          info.message?.videoMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.videoMessage,
          "video"
        );
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const tempVideoPath = join(tmpdir(), `video-${Date.now()}.mp4`);
        const tempGifPath = join(tmpdir(), `video-${Date.now()}.gif`);
        writeFileSync(tempVideoPath, buffer);

        await new Promise((resolve, reject) => {
          ffmpeg(tempVideoPath)
            .output(tempGifPath)
            .on("end", resolve)
            .on("error", reject)
            .run();
        });

        buffer = readFileSync(tempGifPath);

        unlinkSync(tempVideoPath);
        unlinkSync(tempGifPath);
      } else if (isQuotedSticker) {
        const stream = await downloadContentFromMessage(
          info.message?.stickerMessage ||
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage,
          "sticker"
        );
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        if (info.message?.stickerMessage?.isAnimated) {
          // Convierte el sticker animado en un gif
          const tempStickerPath = join(tmpdir(), `sticker-${Date.now()}.webp`);
          const tempGifPath = join(tmpdir(), `sticker-${Date.now()}.gif`);
          writeFileSync(tempStickerPath, buffer);

          await new Promise((resolve, reject) => {
            ffmpeg(tempStickerPath)
              .output(tempGifPath)
              .on("end", resolve)
              .on("error", reject)
              .run();
          });

          buffer = readFileSync(tempGifPath);

          unlinkSync(tempStickerPath);
          unlinkSync(tempGifPath);
        }
      }

      if (isQuotedImage || isQuotedVideo) {
        const sticker = new Sticker(buffer, {
          pack: "Made by",
          author: "Totoro Bot ⚡",
          type: isQuotedImage ? StickerTypes.DEFAULT : StickerTypes.FULL,
          categories: ["⚡"],
          quality: 50,
        });

        const result = await sticker.toMessage();
        totoro.sendMessage(from, result, { quoted: info });
      } else if (isQuotedSticker) {
        // Envia el sticker como imagen o gif
        if (info.message?.stickerMessage?.isAnimated) {
          totoro.sendMessage(
            from,
            { video: buffer, gifPlayback: true },
            { quoted: info }
          );
        } else {
          totoro.sendMessage(from, { image: buffer }, { quoted: info });
        }
      }

      await msg.react("✅");
    } catch (e) {
      console.log(e);
      msg.react("❌");
      sendWarning(totoro, from, "*🚩 Ocurrió un error al procesar el sticker*");
    }
  },
};
