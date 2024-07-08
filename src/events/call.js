const { getHistoryMsg } = require("@whiskeysockets/baileys");

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

    console.log(`- ${call[0].from} intentó llamarme.`);
  },
};
