const { getHistoryMsg } = require("@whiskeysockets/baileys");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  name: "call",
  
  async load(call, sock) {
    const { id, from } = call[0];

    await sock.rejectCall(id, from);

    getHistoryMsg(sock, from, 1).then((msg) => {
      const { messages } = msg;

      if (messages[0].messageStubType === "REVOKE") return;

      sock.sendMessage(from, {
        text: "No puedo recibir llamadas.",
      });
    });

    totoroLog.info(
      "./logs/handlers/call.log",
      `[CALL] ${from} ha intentado llamarme.`
    );
  },
};
