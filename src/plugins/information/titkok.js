const Starlights = require('@StarlightsTeam/Scraper')
const Scraper = new Starlights();
const { help, react } = require("../../functions/messages");


module.exports = {
    name: "tikuser", 
    aliases: ["tiktokuser"],
    category: "multimedia",
    subcategory: "information",
    description: "Obtener información de un usuario de TikTok.",
    usage: "tikuser <nombre de usuario>",
    botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
    userPermissions: [],
    cooldown: 10,

    async execute(totoro, msg, args, text) {
        try {
            console.log("Mensaje recibido:", JSON.stringify(msg, null, 2));

            const remoteJid = msg.key?.remoteJid || msg.messages?.[0]?.key?.remoteJid;
            const messageContent = msg.message || msg.messages?.[0]?.message;
            const messageText = messageContent?.extendedTextMessage?.text || messageContent?.conversation;

            if (!remoteJid || !messageText) {
                throw new Error("El mensaje no contiene remoteJid o texto.");
            }

            let tiktokUser = await Scraper.tiktokUser(text);
            if (!tiktokUser) {
               return help(totoro, msg, "TikTok User", "Obtener información de un usuario de TikTok.", `+tikuser <nombre de usuario>`);
            }

            await react("🍭");

            let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
            txt += `    ✩  *Nro* : ${video.nro}\n`
            txt += `    ✩  *Título* : ${video.title}\n`
            txt += `    ✩  *Autor* : ${video.author}\n`
            txt += `    ✩  *Duración* : ${video.duration} segundos\n`
            txt += `    ✩  *Vistas* : ${video.views}\n`
            txt += `    ✩  *Likes* : ${video.likes}\n`
            txt += `    ✩  *Comentarios* : ${video.comments_count}\n`
            txt += `    ✩  *Compartidos* : ${video.share_count}\n`
            txt += `    ✩  *Publicado* : ${video.published}\n`
            txt += `    ✩  *Descargas* : ${video.download_count}\n\n`
            txt += `> 🚩 ${textbot}`
            
            await totoro.sendFile(remoteJid, video.dl_url, `video_${i + 1}.mp4`, txt, msg);
        } catch (error) {
            console.error("Error en tikuser:", error);
            await totoro.reply(remoteJid, "Ocurrió un error al obtener la información del usuario de TikTok.", msg);
        }
    }

}