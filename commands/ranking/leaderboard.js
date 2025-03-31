const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUserXP, getXpRequired } = require("../../xpsystemv2.js");
const pool = require("../../database.js"); // Asegúrate de importar la conexión a MySQL

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Muestra el top 10 de niveles en el servidor."),

    async execute(interaction) {
        await interaction.deferReply(); // Evita timeout en respuestas largas

        try {
            // 📌 Obtener los 10 usuarios con más nivel en la base de datos
            const [leaderboard] = await pool.query(
                "SELECT user_id, xp, nivel FROM experiencia WHERE guild_id = ? ORDER BY nivel DESC, xp DESC LIMIT 10",
                [interaction.guild.id]
            );

            if (!leaderboard || leaderboard.length === 0) {
                return interaction.editReply("📉 No hay datos en el leaderboard todavía.");
            }

            // 📌 Obtener sufijo ordinal (1st, 2nd, 3rd, etc.)
            function getOrdinal(n) {
                if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
                const lastDigit = n % 10;
                return lastDigit === 1 ? `${n}st` : lastDigit === 2 ? `${n}nd` : lastDigit === 3 ? `${n}rd` : `${n}th`;
            }

            // 📌 Formatear el ranking correctamente
            const rankingText = leaderboard.map((user, index) => {
                const rank = getOrdinal(index + 1);
                const xpRequerido = getXpRequired(user.nivel);
                return `**${rank}** <@${user.user_id}> — **Nivel ${user.nivel}** \`(${user.xp} XP / ${xpRequerido} XP)\``;
            }).join("\n");

            // 📌 Crear embed del leaderboard
            const embed = new EmbedBuilder()
                .setAuthor({ 
                    name: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) || null 
                })
                .setTitle("🏆 Leaderboard")
                .setColor("#F1C40F")
                .setDescription(rankingText.length > 4096 ? rankingText.slice(0, 4093) + "..." : rankingText)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || null)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al obtener el leaderboard:", error);
            return interaction.editReply("❌ Hubo un error al obtener el leaderboard.");
        }
    },
    category: "XP",
};
