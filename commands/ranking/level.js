const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { modifyUserXPv2, getUserXP } = require("../../xpsystemv2.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Modifica los niveles de los usuarios")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // ✅ Requiere permisos de Admin
        .addSubcommand(subcommand =>
            subcommand.setName("add").setDescription("Añade una cantidad de niveles a un usuario.")
                .addUserOption(option => option.setName("user").setDescription("Selecciona un usuario").setRequired(true))
                .addIntegerOption(option => option.setName("amount").setDescription("Número de niveles").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("remove").setDescription("Elimina una cantidad de niveles a un usuario.")
                .addUserOption(option => option.setName("user").setDescription("Selecciona un usuario").setRequired(true))
                .addIntegerOption(option => option.setName("amount").setDescription("Número de niveles").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("set").setDescription("Establece un nivel específico para un usuario.")
                .addUserOption(option => option.setName("user").setDescription("Selecciona un usuario").setRequired(true))
                .addIntegerOption(option => option.setName("amount").setDescription("Número de niveles").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("reset").setDescription("Resetea el nivel de un usuario.")
                .addUserOption(option => option.setName("user").setDescription("Selecciona un usuario").setRequired(true))),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ No tienes permisos para usar este comando.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount") || 0;
        const subcommand = interaction.options.getSubcommand();

        let newLevel;
        if (subcommand === "set") {
            newLevel = amount;
        } else {
            const userXP = await getUserXP(interaction.guild.id, user.id);
            let currentLevel = userXP.nivel || 1;

            switch (subcommand) {
                case "add":
                    newLevel = currentLevel + amount;
                    break;
                case "remove":
                    newLevel = Math.max(1, currentLevel - amount); // Evitar niveles menores a 1
                    break;
                case "reset":
                    newLevel = 1;
                    break;
            }
        }

        await modifyUserXPv2(interaction.guild.id, user.id, 0, newLevel, "set"); // Se actualiza solo el nivel

        await interaction.reply(`✅ **${subcommand}** nivel: <@${user.id}> ahora tiene **Nivel ${newLevel}**.`);
    },
    category: "XP",
};
