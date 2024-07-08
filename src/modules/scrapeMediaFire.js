const axios = require('axios');

module.exports = {
    async scrapeMediafire(getUrl) {
        try {
            const url = "https://cinapis.cinammon.es/mediafire/index.php?url="
            const response = await axios.get(url+getUrl);
            const data = response.data;
            const { Nombre, Subido, MimeType, Peso, Link } = await response.data;

            const error = response.data.error ? true : !Link ? true : false;
            return [error, {
                title: Nombre,
                uploadDate: Subido,
                ext: MimeType,
                size: Peso,
                dl_url: Link
            }];
            
        } catch (e) {
            return console.error(e);
        }
    }
}