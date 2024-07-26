const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "review",
  category: "utilities",
  subcategory: "tools",
  usage: "review <review>",
  description: "Envía una sugerencia a Totoro Reviews",
  dev: false,
  blockcmd: true,
  async execute(totoro, msg, args) {
    const review = args.join(" ");

    if (!review)
      return help(
        totoro,
        msg,
        "review",
        "Envía una sugerencia a Totoro Reviews",
        "review <review>"
      );

    const user = msg.messages[0]?.pushName || ".";

    const content = `*Sugerencia de ${user}*\n${review}`;

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
        footer: { text: "Totoro Reviews" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Review",
                id: `sendReview+${review}`,
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
