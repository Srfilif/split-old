const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "split_bot"
});

console.log("✅ Conexión a la base de datos establecida.");

module.exports = pool;

pool.query(
    "INSERT INTO experiencia (guild_id, user_id, xp, nivel) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE xp = ?, nivel = ?",
    [1, 2, 1, 3, 1, 3]
);