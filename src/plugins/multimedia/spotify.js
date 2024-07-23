const puppeteer = require("puppeteer");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "spotify",
  aliases: ["asp", "spa", "spmp3", "sp", "spaudio", "totorosp", "tsp"],
  category: "multimedia",
  subcategory: "spotify",
  description: "Obtiene información de audios de Spotify.",
  usage: "spmp3 <spotify url o nombre>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!participant && !remoteJid) {
      return sendError(
        totoro,
        msg,
        "No se pudo obtener el número del usuario o el chat."
      );
    }

    if (!args[0]) {
      return help(
        totoro,
        msg,
        "spmp3",
        "Obtiene información de audios de Spotify.",
        "spmp3 <spotify url o nombre>"
      );
    }

    try {
      let trackQuery = args.join(" ");
      await msg.react("⏳");

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
      });
      const page = await browser.newPage();
      await page.goto('https://open.spotify.com/search', { waitUntil: 'networkidle2' });

      // Esperar el input de búsqueda y escribir la consulta
      await page.waitForSelector('input[data-testid="search-input"]', { timeout: 10000 });
      await page.type('input[data-testid="search-input"]', trackQuery);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000); // Esperar a que cargue la búsqueda

      // Comprobar si hay resultados
      const resultsExist = await page.$('[data-testid="tracklist-row"]');
      if (!resultsExist) {
        throw new Error("No se encontraron resultados para la búsqueda.");
      }

      // Obtener resultados de la búsqueda
      const tracks = await page.evaluate(() => {
        const trackElements = document.querySelectorAll('[data-testid="tracklist-row"]');
        let trackInfo = [];

        trackElements.forEach(track => {
          const titleElement = track.querySelector('[data-testid="track-name"]');
          const artistElement = track.querySelector('[data-testid="artists"]');
          const linkElement = track.querySelector('a');

          if (titleElement && artistElement && linkElement) {
            const title = titleElement.textContent;
            const artist = artistElement.textContent;
            const url = linkElement.href;

            trackInfo.push({ title, artist, url });
          }
        });

        return trackInfo;
      });

      await browser.close();

      if (tracks.length === 0) {
        throw new Error("No se encontraron resultados para la búsqueda.");
      }

      const track = tracks[0];
      const metadata = `Título: ${track.title}\nArtista: ${track.artist}\nURL: ${track.url}`;

      await totoro.sendMessage(
        remoteJid || participant,
        {
          text: metadata,
        },
        { quoted: msg.messages[0] }
      );

      await msg.react("🔊");
    } catch (error) {
      console.error("Error durante la búsqueda en Spotify:", error); // Agregar log para errores
      await sendError(totoro, msg, `${error.message}`);
    }
  },
};
