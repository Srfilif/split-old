const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  
    .setName("userinfo")
    .setDescription("Muestra información detallada de un usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario del que deseas obtener información.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("usuario") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    // Obtener datos básicos
    const userId = user.id;
    const userTag = user.tag;
    const createdAt = user.createdAt;
    const joinedAt = member?.joinedAt || "No disponible";
    const nickname = member?.nickname || "No tiene";
    const bot = user.bot ? "Sí" : "No";

    // Estado del usuario (disponible solo si el usuario está en el servidor)
    const status = member?.presence?.status || "Desconocido";

    // Roles del usuario
    const roles =
      member?.roles.cache
        .filter((role) => role.id !== interaction.guild.id) // Excluir el rol @everyone
        .map((role) => role.toString())
        .join(", ") || "No tiene";

    // Crear embed
    const embed = new EmbedBuilder()
      .setColor(0x7289da)
      .setTitle("Información del Usuario")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "ID", value: userId, inline: true },
        { name: "TAG", value: userTag, inline: true },
        {
          name: "Fecha de creación de la cuenta",
          value: `<t:${Math.floor(
            createdAt.getTime() / 1000
          )}:F> (<t:${Math.floor(createdAt.getTime() / 1000)}:R>)`,
          inline: false,
        },
        {
          name: "Fecha de entrada al servidor",
          value:
            joinedAt !== "No disponible"
              ? `<t:${Math.floor(
                  joinedAt.getTime() / 1000
                )}:F> (<t:${Math.floor(joinedAt.getTime() / 1000)}:R>)`
              : "No disponible",
          inline: false,
        },
        {
          name: "Estado",
          value: status.charAt(0).toUpperCase() + status.slice(1),
          inline: true,
        },
        { name: "Apodo", value: nickname, inline: true },
        { name: "BOT", value: bot, inline: true },
        { name: "Roles", value: roles, inline: false }
      )
      .setFooter({
        text: "Información del sistema - Split BOT",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
