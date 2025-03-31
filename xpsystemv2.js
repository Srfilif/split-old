const mysql = require("mysql2/promise");
const fs = require("fs");
const dotenv = require("dotenv");
const chalk = require("chalk");

dotenv.config({ path: "./config/config.env" });
const DEBUG_MODE = parseInt(process.env.DEBUG_MODE) || 1;
const LOG_FILE = "logs/ranking.txt";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "split_bot"
});

if (DEBUG_MODE === 3) console.log(chalk.green("✅ Conexión a la base de datos establecida."));

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

function getXpRequired(level) {
    return 100 * level + 4000;
}

async function ensureUserExists(guildId, userId) {
    const [rows] = await pool.query(
        "SELECT 1 FROM experiencia WHERE guild_id = ? AND user_id = ?",
        [guildId, userId]
    );

    if (rows.length === 0) {
        logInfo(`Usuario ${chalk.yellow(userId)} no existe en la base de datos. Creando entrada...`);
        await pool.query(
            "INSERT INTO experiencia (guild_id, user_id, xp, nivel) VALUES (?, ?, 0, 1)",
            [guildId, userId]
        );
    }
}

async function getUserXP(guildId, userId) {
    logInfo(`Obteniendo XP de usuario: ${chalk.yellow(userId)} en servidor: ${chalk.cyan(guildId)}`);
    try {
        const [rows] = await pool.query(
            "SELECT xp, nivel FROM experiencia WHERE guild_id = ? AND user_id = ?", 
            [guildId, userId]
        );
        logInfo("Datos obtenidos: " + JSON.stringify(rows));
        return rows[0] || { xp: 0, nivel: 1 };
    } catch (error) {
        logError("Error al obtener XP: " + error);
        return { xp: 0, nivel: 1 };
    }
}

async function addXp(guildId, userId, xpAmount) {
    logInfo(`Añadiendo ${chalk.green(xpAmount)} XP a usuario: ${chalk.yellow(userId)} en servidor: ${chalk.cyan(guildId)}`);
    try {
        let user = await getUserXP(guildId, userId);
        let totalXp = user.xp + xpAmount;
        let level = user.nivel;

        while (totalXp >= getXpRequired(level)) {
            totalXp -= getXpRequired(level);
            level++;
        }

        logInfo(`Usuario ${chalk.yellow(userId)} ahora tiene ${chalk.green(totalXp)} XP y nivel ${chalk.magenta(level)}.`);

        await pool.query(
            `INSERT INTO experiencia (guild_id, user_id, xp, nivel) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE xp = VALUES(xp), nivel = VALUES(nivel)`,
            [guildId, userId, totalXp, level]
        );

        logInfo("Datos insertados/actualizados correctamente en la base de datos.");
    } catch (error) {
        logError("Error al insertar/actualizar XP: " + error);
    }
}

async function modifyUserXP(guildId, userId, amount, action) {
    logInfo(`Modificando XP de usuario: ${chalk.yellow(userId)} en servidor: ${chalk.cyan(guildId)} | Acción: ${chalk.magenta(action)} | Cantidad: ${chalk.green(amount)}`);
    try {
        let user = await getUserXP(guildId, userId);
        let newXp = user.xp;

        switch (action) {
            case "add":
                newXp += amount;
                break;
            case "remove":
                newXp = Math.max(0, newXp - amount);
                break;
            case "set":
                newXp = Math.max(0, amount);
                break;
            case "reset":
                newXp = 0;
                break;
            default:
                logError("Acción no válida.");
                return;
        }
        await ensureUserExists(guildId, userId);

        logInfo(`XP actualizado: ${chalk.green(newXp)}`);

        await pool.query(
            "UPDATE experiencia SET xp = ? WHERE guild_id = ? AND user_id = ?", 
            [newXp, guildId, userId]
        );

        logInfo("XP modificado correctamente en la base de datos.");
    } catch (error) {
        logError("Error al modificar XP: " + error);
    }
}
async function getUserRank(guildId, userId) {
    logInfo(`Obteniendo el rango del usuario ${chalk.yellow(userId)} en servidor: ${chalk.cyan(guildId)}`);
    
    try {
        // Obtener los datos de XP y nivel del usuario que ejecutó el comando
        const [userData] = await pool.query(
            "SELECT xp, nivel FROM experiencia WHERE guild_id = ? AND user_id = ?",
            [guildId, userId]
        );

        if (!userData.length) {
            logError(`Usuario ${chalk.yellow(userId)} no encontrado en la base de datos.`);
            return { rank: null, xp: 0, level: 1 };
        }

        const { xp, nivel } = userData[0];
        
        // Obtener todos los usuarios del servidor ordenados por XP y nivel
        const [rankData] = await pool.query(
            "SELECT user_id, xp, nivel FROM experiencia WHERE guild_id = ? ORDER BY nivel DESC, xp DESC",
            [guildId]
        );

        // Encontrar el puesto del usuario en el ranking
        let rank = 1;
        for (let i = 0; i < rankData.length; i++) {
            if (rankData[i].user_id === userId) {
                break;
            }
            rank++;
        }

        logInfo(`Usuario ${chalk.yellow(userId)} tiene el rango #${chalk.magenta(rank)} con ${chalk.green(xp)} XP y nivel ${chalk.blue(nivel)}`);

        return { rank, xp, nivel };
    } catch (error) {
        logError("Error al obtener el rango del usuario: " + error);
        return { rank: null, xp: 0, nivel: 1 };
    }
}

async function modifyUserXPv2(guildId, userId, amount, level, action) {
    logInfo(`Modificando XP de usuario: ${chalk.yellow(userId)} en servidor: ${chalk.cyan(guildId)} | Acción: ${chalk.magenta(action)} | Cantidad: ${chalk.green(amount)}`);

    try {
        let user = await getUserXP(guildId, userId);
        let newXp = user.xp;
        let newLevel = user.level || 1; // Si no tiene nivel, empieza en 1
        newLevel = level;

        switch (action) {
            case "add":
                newXp += amount;
                break;
            case "remove":
                newXp = Math.max(0, newXp - amount);
                break;
            case "set":
                newXp = Math.max(0, amount);
                break;
            case "reset":
                newXp = 0;
                newLevel = 1; // Si se resetea XP, también el nivel
                break;
            default:
                logError("Acción no válida.");
                return;
        }

        await ensureUserExists(guildId, userId);

        logInfo(`XP actualizado: ${chalk.green(newXp)}, Nivel actualizado: ${chalk.blue(newLevel)}`);

        // Actualizar en la base de datos
        await pool.query(
            "UPDATE experiencia SET xp = ?, nivel = ? WHERE guild_id = ? AND user_id = ?",
            [newXp, newLevel, guildId, userId]
        );

        logInfo("XP y Nivel modificados correctamente en la base de datos.");
    } catch (error) {
        logError("Error al modificar XP y Nivel: " + error);
    }
}


module.exports = {
    addXp,
    getUserXP,
    modifyUserXP,
    modifyUserXPv2,
    getXpRequired,
    getUserRank
    


};
