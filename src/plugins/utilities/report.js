const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

module.exports = {
  name: "report",
  category: "utilities",
  subcategory: "report",
  usage: "report <report>",
  description: "Envía un reporte a Totoro Reports",

  async execute(totoro, msg, args) {
    const report = args.join(" ");

    if (!report)
      return help(
        totoro,
        msg,
        "report",
        "Envía un reporte a Totoro Reports",
        "report <report>"
      );

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
