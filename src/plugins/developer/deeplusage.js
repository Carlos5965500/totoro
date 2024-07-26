require("dotenv").config();
const https = require("https");
const { sendError, sendMessage } = require("../../functions/messages");

const apiKey = process.env.DEEPL_API_KEY;
const costPerCharacterEUR = 0.000018; // Costo por carácter traducido en euros
const budgetEUR = 50; // Presupuesto en euros

module.exports = {
  name: "usage",
  aliases: ["usg"],
  description: "Muestra el uso actual de la API de DeepL.",
  category: "utilities",
  subcategory: "tools",
  usage: `usage`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  dev: true,

  execute: async (totoro, msg, args) => {
    try {
      const usageInfo = await getUsageInfo();

      const characterCount = usageInfo.character_count;
      const characterLimit = usageInfo.character_limit;
      const usagePercentage = ((characterCount / characterLimit) * 100).toFixed(
        2
      );
      const cost = (characterCount * costPerCharacterEUR).toFixed(2);

      let responseMessage = `Uso actual de la API de DeepL:\n\n`;
      responseMessage += `Caracteres traducidos este mes: ${characterCount}\n`;
      responseMessage += `Límite de caracteres: ${characterLimit}\n`;
      responseMessage += `Porcentaje de uso: ${usagePercentage}%\n`;
      responseMessage += `Costo estimado: €${cost}\n`;

      if (cost > budgetEUR) {
        responseMessage += `\n⚠️ Advertencia: Has superado el presupuesto de €${budgetEUR}.\n`;
      }

      await sendMessage(totoro, msg, responseMessage);
    } catch (error) {
      console.error("Error retrieving usage information:", error);
      await sendError(totoro, msg, error.message);
    }
  },
};

function getUsageInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api-free.deepl.com",
      path: "/v2/usage",
      method: "GET",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result);
        } else {
          reject(new Error(res.statusCode));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}
