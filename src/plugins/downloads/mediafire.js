const fs = require('fs');
const { URL } = require('url');
const { scrapeMediafire } = require('../../modules/scrapeMediaFire');
const axios = require('axios');
const path = require('path');
const mime = require('mime-types');
const totoroLog = require("../../functions/totoroLog");
const sendError = require("../../functions/messages");


module.exports = {
    name: "mediafire",
    category: "downloads",
    subcategory: "mediafire",
    usage: "mediafire <enlace>",
    description: "Descarga archivos de Mediafire",
    async execute(totoro, msg, args, text) {
        if (!args[0]) {
            return msg.reply(
                "🍭 Ingresa el enlace del archivo de Mediafire junto al comando.\n\n" +
                `Ejemplo: ${totoro.prefix}mediafire https://www.mediafire.com/file/433hbpsc95unywu/Oshi_no_Ko_01.mp4/file?dkey=jpivv6z5osa&r=1587`
            );
        }

        // Verificar la estructura del objeto msg
        if (!msg.messages || !msg.messages[0] || !msg.messages[0].key || !msg.messages[0].key.remoteJid) {
            return msg.reply("🍭 Error: Mensaje inválido. No se pudo determinar el remitente.");
        }

        try {
            const url = args[0];

            // Enviar reacción de carga al iniciar la descarga
            await totoro.sendMessage(msg.messages[0].key.remoteJid, {
                react: {
                    text: '⏳', // Emoji de carga
                    key: msg.messages[0].key
                }
            });

            const datos = await scrapeMediafire(url); 
            const { title, size, uploadDate, dl_url, ext } = datos[1];
            if (datos[0]) {
                // Enviar reacción de error con signo de interrogación y cruz
                await totoro.sendMessage(msg.messages[0].key.remoteJid, {
                    react: {
                        text: '❓', // Emoji de interrogación y cruz
                        key: msg.messages[0].key
                    }
                });
                return msg.reply(`╭─⬣「 *Mediafire Download Error* 」⬣\n╰─ ≡◦ *🍭 Totoro no pudo encontrar el archivo solicitado. ¿URL Válida?*`);
            }

            const { data: fileBuffer } = await descargarArchivo(dl_url);
            
            const fileName = `${title}.${ext}`;
            const mimetype = mime.lookup(fileName);

            const messageOptions = {
                document: fileBuffer,
                mimetype: mimetype,
                fileName: fileName,
                caption: `╭─⬣「 *Mediafire Download* 」─⬣\n│ ≡◦ *🍭 fecha ∙* ${uploadDate}\n│ ≡◦ *🍭 Nombre ∙* ${title}\n│ ≡◦ *📚 Extensión ∙* ${ext}\n│ ≡◦ *⚖ Peso ∙* ${size}\n╰─⬣`
            };

            await totoro.sendMessage(msg.messages[0].key.remoteJid, messageOptions);

            // Enviar reacción de éxito al terminar la descarga
            await totoro.sendMessage(msg.messages[0].key.remoteJid, {
                react: {
                    text: '🍭', // Emoji de éxito
                    key: msg.messages[0].key
                }
            });

        } catch (error) {
            totoroLog.error(
                './logs/plugins/downloads/mediafire.log',
                `Error al descargar el archivo: ${error.message}`
            );
            await totoro.sendMessage(msg.messages[0].key.remoteJid, {
                react: {
                    text: '❌', // Emoji de error
                    key: msg.messages[0].key
                }
            });
            return msg.reply(`╭─⬣「 *Mediafire Download Error* 」⬣\n╰─ ≡◦ *🍭 Totoro está experimentando un error*\n> *Error*: ${error.message}`);
        }
    },
};

async function descargarArchivo(url) {
    try {
        // Configura Axios para obtener una respuesta tipo arraybuffer
        const respuesta = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // Extrae el nombre del archivo de la URL
        const nombreArchivo = path.basename(new URL(url).pathname);

        // Devuelve el buffer de datos y el nombre del archivo
        return { data: respuesta.data, nombreArchivo };
    } catch (error) {
        totoroLog.error(
            './logs/plugins/downloads/mediafire.log',
            `Error al descargar el archivo: ${error.message}`
        );
        sendError(totoro, msg,  `Error al descargar el archivo: ${error.message}`);
    }
}
