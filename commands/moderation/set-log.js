const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-log')
        .setDescription('Configura el canal de logs para el servidor.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('El canal donde se enviarán los logs.')
                .setRequired(true))
       .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');

        // Verifica que el canal sea un canal de texto
        if (!channel.isTextBased()) {
            return interaction.reply({
                content: 'Por favor selecciona un canal de texto válido.',
                ephemeral: true
            });
        }

        // Ruta al archivo de configuración
        const logsPath = path.join(__dirname, '../data/logs.json');

        // Crea el archivo si no existe
        if (!fs.existsSync(logsPath)) {
            fs.writeFileSync(logsPath, JSON.stringify({}, null, 4));
        }

        // Lee las configuraciones actuales
        const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));

        // Actualiza la configuración para este servidor
        logsConfig[interaction.guild.id] = {
            logChannelId: channel.id
        };

        // Guarda la configuración actualizada
        fs.writeFileSync(logsPath, JSON.stringify(logsConfig, null, 4));

        // Responde al usuario
        await interaction.reply({
            content: `El canal de logs ha sido configurado correctamente en ${channel}.`,
            ephemeral: true
        });
    },

    category: 'Configuración',
};

