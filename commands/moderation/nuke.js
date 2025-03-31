const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Clona y elimina el canal actual.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.channel;

        // Verificar si el miembro tiene permisos para gestionar canales
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const embedNoPermissions = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('No tienes permisos para usar este comando.')
                .setColor('RED')
                .setTimestamp();

            return interaction.reply({ embeds: [embedNoPermissions], ephemeral: true });
        }

        try {
            // Responder a la interacción antes de eliminar el canal
            await interaction.reply({
                content: 'El canal será nukeado en unos momentos...',
                ephemeral: true,
            });

            // Clonar el canal actual
            const newChannel = await channel.clone();
            await newChannel.setPosition(channel.position);

            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setColor(16734430)
                .setTitle('Moderación - Split BOT')
                .setDescription(`El canal ha sido nukeado por ${interaction.user.username}`)
                .setImage('https://i.gifer.com/6Ip.gif')
                .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Enviar el embed al nuevo canal
            await newChannel.send({ embeds: [embed] });

            // Eliminar el canal original
            await channel.delete();
        } catch (error) {
            console.error('Error al nuke el canal:', error);

            const embedError = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Hubo un problema al intentar nuke el canal.')
                .setColor(16734430)
                .setTimestamp();

            try {
                await interaction.editReply({ embeds: [embedError], ephemeral: true });
            } catch (editError) {
                console.error('No se pudo editar la respuesta de interacción:', editError);
            }
        }
    },
    category: 'Moderación',
};
