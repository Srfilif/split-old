const { Events } = require("discord.js");
const { addXp, getUserXP, getXpRequired, modifyUserXP,modifyUserXPv2 } = require("../xpsystemv2");
const chalk = require("chalk");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });
const DEBUG_MODE = parseInt(process.env.DEBUG_MODE) || 1;
const LOG_FILE = "./logs/ranking.txt";

function logInfo(message) {
    if (DEBUG_MODE === 3) {
        const logMessage = chalk.blue("INFO:") + ` ${message}`;
        console.log(logMessage);
        fs.appendFileSync(LOG_FILE, logMessage + "\n");
    }
}

function logError(message) {
    if (DEBUG_MODE >= 1) {
        const logMessage = chalk.red("ERROR:") + ` ${message}`;
        console.error(logMessage);
        fs.appendFileSync(LOG_FILE, logMessage + "\n");
    }
}

async function sendLevelUpMessage(guild, userId, level) {
    let channel = guild.channels.cache.find(c => c.name === "niveles" && c.isTextBased());

    if (!channel) {
        // Buscar un canal donde pueda escribir
        channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has("SEND_MESSAGES"));
    }

    if (channel) {
        try {
            await channel.send(`🎉 ¡Felicidades <@${userId}>, has subido al nivel ${level}! 🎊`);
            logInfo(`Mensaje de nivel enviado en #${channel.name} para <@${userId}> (Nivel ${level})`);
        } catch (error) {
            logError(`Error al enviar mensaje de nivel en ${channel.name}: ${error}`);
        }
    } else {
        logError(`No se encontró un canal adecuado en el servidor ${guild.name}.`);
    }
}
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot || !message.guild) return; // Ignorar bots y mensajes fuera de servidores

            const guildId = message.guild.id;
            const userId = message.author.id;

            // 📌 Calcular XP basado en la longitud del mensaje
            const baseXp = 5;
            const maxXp = 100;
            const xpGanado = Math.min(baseXp + Math.floor(message.content.length / 10), maxXp);

            // 📌 Obtener XP actual y nivel del usuario
            let { xp, nivel } = await getUserXP(guildId, userId);
            let xpNecesaria = getXpRequired(nivel);

            // 📌 Sumar XP
            xp += xpGanado;

            // 📌 Verificar si sube de nivel
            let subioDeNivel = false;
            while (xp >= xpNecesaria) {
                xp -= xpNecesaria; // Restar XP necesaria
                nivel++; // Subir de nivel
                xpNecesaria = getXpRequired(nivel);
                subioDeNivel = true;
            }

            // 📌 Guardar XP y nivel en la base de datos con `modifyUserXP`
          //  await modifyUserXP(guildId, userId, xp, "set"); // Establecer la XP nueva
            await modifyUserXPv2(guildId, userId, xp,nivel, "set"); // Establecer el nivel nuevo

            // 📌 Registrar log
            logInfo(`Se le añadió ${chalk.green(xpGanado)} XP a ${chalk.yellow(message.author.tag)} en el servidor ${chalk.cyan(message.guild.name)}`);

            // 📌 Enviar mensaje si subió de nivel
            if (subioDeNivel) {
                await sendLevelUpMessage(message.guild, userId, nivel);
            }

        } catch (error) {
            logError("Error al otorgar XP: " + error);
        }
    },
};
