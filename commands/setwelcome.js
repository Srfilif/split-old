const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configura el canal de bienvenida y opciones personalizadas.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('El canal donde se enviarán las bienvenidas.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('backgroundurl')
                .setDescription('URL de la imagen de fondo para la bienvenida.')
                .setRequired(false)) // Este campo es opcional
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Texto personalizado que aparecerá en la bienvenida.')
                .setRequired(false)) // Este campo también es opcional
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const backgroundUrl = interaction.options.getString('backgroundurl') || 'https://i.imgur.com/umLOhA3.png'; // Valor por defecto si no se proporciona
        const texto = interaction.options.getString('texto') || '¡Bienvenido al servidor!'; // Valor por defecto si no se proporciona

        // Guardar configuración en un archivo JSON
        const configPath = path.join(__dirname, '../data/welcomeConfig.json');
        const configData = {
            guildId: interaction.guild.id,
            channelId: channel.id,
            backgroundUrl: backgroundUrl,
            texto: texto,
        };

        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');

        await interaction.reply({
            content: `Canal de bienvenida configurado correctamente en ${channel}. \nFondo de bienvenida: ${backgroundUrl} \nTexto de bienvenida: "${texto}"`,
            ephemeral: true,
        });
    },
    category: 'Configuración',
    usage: '/setwelcome [channel] [backgroundurl] [texto]',
};
