const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "report",
  category: "utilities",
  subcategory: "c",
  usage: "c",
  description: "c",

  async execute(totoro, msg, args) {
    const report = args.join(" ");

    if (!report) return msg.reply("Totoro Reports");

    const user = msg.messages[0]?.pushName || ".";

    const content = `*Reporte de ${user}*\n${report}`;

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
        footer: { text: "Totoro Reports" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Enviar",
                id: `sendReport+${report}`,
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
