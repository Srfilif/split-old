const { SlashCommandBuilder } = require("discord.js");
const xpSystem = require("../../xpsystemv2.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("Añadir o quitar XP a un usuario")
        .addUserOption(option =>
            option.setName("usuario").setDescription("Usuario objetivo").setRequired(true))
        .addIntegerOption(option =>
            option.setName("cantidad").setDescription("Cantidad de XP").setRequired(true))
            
        .addStringOption(option =>
            option.setName("acción").setDescription("Añadir o quitar XP").setRequired(true)
                .addChoices(
                    { name: "Añadir", value: "add" },
                    { name: "Quitar", value: "remove" }
                )),

    async execute(interaction) {
        const user = interaction.options.getUser("usuario");
        const amount = interaction.options.getInteger("cantidad");
        const action = interaction.options.getString("acción");

        console.log(`🎮 Comando XP ejecutado por ${interaction.user.tag} para ${user.username} | Acción: ${action} | Cantidad: ${amount}`);
        try {
            await xpSystem.modifyUserXP(interaction.guild.id, user.id, amount, action);
            await interaction.reply(`XP ${action === "add" ? "añadido" : "removido"} correctamente a ${user.username}.`);
            console.log("✅ Comando ejecutado con éxito.");
        } catch (error) {
            console.error("❌ Error al ejecutar comando XP:", error);
            await interaction.reply("❌ Hubo un error al modificar el XP.");
        }
    }
};
