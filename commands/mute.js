const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia a un miembro del servidor por una duración específica.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas silenciar.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duracion')
                .setDescription('Duración del silencio en minutos.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón del silencio.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const duration = interaction.options.getInteger('duracion');
        const reason = interaction.options.getString('razon') || 'No especificada';
        const member = interaction.guild.members.cache.get(user.id);

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muteado');

        if (!muteRole) {
            return interaction.reply({
                content: 'No se encontró un rol llamado "Muteado". Por favor, crea un rol con ese nombre y configura los permisos adecuados.',
                ephemeral: true
            });
        }

        if (!member) {
            return interaction.reply({ content: 'El usuario no está en el servidor.', ephemeral: true });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({ content: 'No puedes silenciarte a ti mismo.', ephemeral: true });
        }

        if (duration <= 0 || duration > 1440) { // Validación de duración (máximo 24 horas)
            return interaction.reply({ content: 'La duración debe ser un valor entre 1 y 1440 minutos (24 horas).', ephemeral: true });
        }

        const durationMs = duration * 60 * 1000; // Convertir minutos a milisegundos

        try {
            await member.roles.add(muteRole);
            const embed = new EmbedBuilder()
                .setColor(16734430)
                .setTitle('Moderación - Split BOT')
                .setDescription(`<@${user.id}> fue silenciado por ${duration} minutos.\n**Razón:** ${reason}`)
                .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Remover el rol de mute después de la duración especificada
            setTimeout(async () => {
                if (member.roles.cache.has(muteRole.id)) {
                    await member.roles.remove(muteRole);
                    await member.send(`Has sido desmuteado en **${interaction.guild.name}**.`);
                }
            }, durationMs);

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(16734430)
                .setTitle('Moderación - Split BOT')
                .setDescription('No pude silenciar a este usuario. Puede que sea un administrador o que no tengas los permisos necesarios.')
                .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
    category: 'Moderación',
};
