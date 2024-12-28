const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remueve el silencio de un miembro del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas dejar de silenciar.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'El usuario no está en el servidor.', ephemeral: true });
        }

        if (!member.communicationDisabledUntil) {
            return interaction.reply({ content: 'Este usuario no está silenciado.', ephemeral: true });
        }

        try {
            await member.timeout(null); // Elimina el timeout
            const embed = new EmbedBuilder()
                .setColor(16734430)
                .setTitle('Moderación - Split BOT')
                .setDescription(`<@${user.id}> ya no está silenciado.`)
                .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(16734430)
                .setTitle('Moderación - Split BOT')
                .setDescription('No pude quitar el silencio de este usuario. Puede que sea un administrador o que no tengas los permisos necesarios.')
                .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
    category: 'Moderación',
};
