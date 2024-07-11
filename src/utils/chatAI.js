const totoroLog = require("../functions/totoroLog");
const { sendError } = require("../functions/messages");
const openai = require("openai");
require("dotenv").config();

openai.apiKey = process.env.OPENAI_API_KEY;

async function chatAI(totoro, message, msg) {
  const remoteJid = msg.messages[0].key.remoteJid;

  try {
    const response = await openai.ChatCompletion.create({
      model: "gpt-4", // Especifica el modelo de OpenAI que deseas usar
      messages: [{ role: "user", content: message }],
    });

    const reply = response.choices[0].message.content;
    return reply;
  } catch (error) {
    totoroLog.error(
      "./logs/functions/chatAI.log",
      `Error generando respuesta: ${error}`
    );
    sendError(totoro, remoteJid, `Error generando respuesta: ${error}`);
  }
}

module.exports = { chatAI };
