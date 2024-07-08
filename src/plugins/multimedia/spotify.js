module.exports = {
    name: "spotify",
    aliases: ["sp"],
    category: "multimedia",
    subcategory: "music",
    description: "Busca canciones de Spotify.",
    usage: "spotify <titulo>",
    botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
    userPermissions: [],
    cooldown: 10,

    async execute(sock, msg, args) {
    }
};