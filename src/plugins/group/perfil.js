const totoUser = require("../../models/totoUser");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
    name: "perfil",
    category: "group",
    subcategory: "totoU",
    description: "Muestra el perfil de un usuario",
    usage: "perfil <@usuario>",
    aliases: ["profile", "p"],

    // crear el perfil de un usuario ya registrado
    
    async execute(totoro, msg, args, totoUser, sendWarning, countTotoUsers) {
        const remoteJid = msg.messages[0].key.remoteJid; 
        const userCount = await countTotoUsers();
        const totoU = await totoUser.findOne({ where: { phone: totoU } });
        if (!totoU) {
            await sendWarning(totoro, msg, "No se encontró el usuario solicitado.");
            return;
        }

        if (!args[0]) {
            await sendWarning(totoro, msg, "Debes mencionar a un usuario.");
            return;
        }

        const profileMessage =
        `╭─⬣「 *Perfil de ${totoU.name}* 」⬣\n` + 
        `│  ≡◦ *🍭 Nombre*: ${totoU.name}\n` +
        `│  ≡◦ *🍭 Edad*: ${totoU.age}\n` +
        `│  ≡◦ *🍭 País*: ${totoU.country}\n` +
        `│  ≡◦ *🍭 Serial Number*: ${totoU.serialNumber}\n` +
        `│  ≡◦ *🍭 Número de teléfono*: ${totoU.phone}\n` +
        `│  ≡◦ *🍭 totoUser ID*: ${totoU.id}\n` +
        `╰─⬣\n\n` +
        `> *Contigo somos ${userCount} totoUsers*;`

        try {
            await totoro.sendMessage(remoteJid, { text: profileMessage });
        } catch (error) {
            totoroLog.error("./logs/plugins/group/perfil.log", `Error enviando mensaje de perfil: ${error}`);
        }

    }
};