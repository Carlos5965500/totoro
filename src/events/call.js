const { getHistoryMsg } = require("@whiskeysockets/baileys");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  name: "call",

  async load(call, totoro) {
    const { id, from } = call[0];

    await totoro.rejectCall(id, from);

    getHistoryMsg(totoro, from, 1).then((msg) => {
      const { messages } = msg;

      if (messages[0].messageStubType === "REVOKE") return;

      totoro.sendMessage(from, {
        text: "📞 Lamentablemente no puedo recibir llamadas.",
      });
    });

    totoroLog.info(
      "./logs/handlers/call.log",
      `[CALL] ${from} ha intentado llamarme.`
    );
  },
};
