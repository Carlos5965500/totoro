const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "suggest",
  category: "utilities",
  subcategory: "c",
  usage: "c",
  description: "c",

  async execute(totoro, msg, args) {
    const suggest = args.join(" ");

    if (!suggest) return msg.reply("Totoro Suggests");

    const user = msg.messages[0]?.pushName || ".";

    const content = `*Sugerencia de ${user}*\n${suggest}`;

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: "https://i.ibb.co/j9N5kj3/image.jpg" },
      },
      { upload: totoro.waUploadToServer }
    );

    const message = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: "Totoro Suggests" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Enviar",
                id: `sendSuggest+${suggest}`,
              }),
            },
          ],
          messageParamsJson: "",
        },
      },
    };

    totoro.relayMessage(
      msg.messages[0].key.remoteJid,
      { viewOnceMessage: { message } },
      {
        quoted: msg.messages[0],
      }
    );
  },
};
