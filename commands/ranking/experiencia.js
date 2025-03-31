const { SlashCommandBuilder } = require("discord.js");
const { getUserXP, getXpRequired, addXpAndCheckLevelUp } = require("../../xpsystemv2");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("experiencia")
        .setDescription("Muestra tu XP actual y cuánta XP te falta para subir de nivel."),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            // Obtener XP y nivel del usuario
            let { xp, nivel } = await getUserXP(guildId, userId);
            let xpNecesaria = getXpRequired(nivel) - xp;

            // Verificar si el usuario debe subir de nivel

            // Enviar respuesta al usuario
            await interaction.reply(`📊 **Tu XP:** ${xp}/${getXpRequired(nivel)}\n🔺 **Nivel:** ${nivel}\n⚡ **XP para subir de nivel:** ${xpNecesaria}`);
        } catch (error) {
            await interaction.reply("❌ Ocurrió un error al obtener tu experiencia.");
        }
    },
};
