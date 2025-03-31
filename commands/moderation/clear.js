const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina mensajes en el canal actual o en un canal específico.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (máximo 100).')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('El canal donde se eliminarán los mensajes (opcional).'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const canal = interaction.options.getChannel('canal') || interaction.channel;

        if (!canal.isTextBased()) {
            return interaction.reply({
                content: 'Por favor, selecciona un canal de texto válido.',
                ephemeral: true,
            });
        }

        if (cantidad < 1 || cantidad > 100) {
            return interaction.reply({
                content: 'Debes especificar un número entre 1 y 100.',
                ephemeral: true,
            });
        }

        try {
            const mensajes = await canal.bulkDelete(cantidad, true);
            await interaction.reply({
                content: `✅ Se eliminaron ${mensajes.size} mensajes en ${canal}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            interaction.reply({
                content: '❌ Ocurrió un error al intentar eliminar los mensajes. Asegúrate de que el bot tiene los permisos necesarios.',
                ephemeral: true,
            });
        }
    },
    category: 'Utilidad', // Categoría del comando

};
