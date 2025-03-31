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
        const backgroundUrl = interaction.options.getString('backgroundurl') || 'assets/images/fondo.jpeg'; // Nueva ruta por defecto
        const texto = interaction.options.getString('texto') || '¡Bienvenido al servidor!'; // Valor por defecto si no se proporciona

        const configPath = path.join(__dirname, '../../data/welcomeConfig.json');

        // Leer la configuración existente
        let configData = {};
        if (fs.existsSync(configPath)) {
            try {
                const rawData = fs.readFileSync(configPath, 'utf8');
                configData = JSON.parse(rawData);
            } catch (error) {
                console.error('Error al leer el archivo JSON:', error);
                configData = {};
            }
        }

        // Actualizar la configuración para este servidor
        configData[interaction.guild.id] = {
            channelId: channel.id,
            backgroundUrl: backgroundUrl,
            texto: texto,
        };

        // Guardar la configuración actualizada
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');

        await interaction.reply({
            content: `Canal de bienvenida configurado correctamente en ${channel}. \nFondo de bienvenida: ${backgroundUrl} \nTexto de bienvenida: "${texto}"`,
            ephemeral: true,
        });
    },
    category: 'Configuración',
    usage: '/setwelcome [channel] [backgroundurl] [texto]',
};
