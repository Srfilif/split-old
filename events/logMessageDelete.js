const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Events } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        try {
            if (!message.guild) return; // Ignorar mensajes borrados fuera de un servidor

            // Ruta al archivo de configuración
            const logsPath = path.join(__dirname, '../data/logs.json');

            // Verifica si existe el archivo de configuración
            if (!fs.existsSync(logsPath)) return;

            // Lee las configuraciones actuales
            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));

            // Obtén el canal configurado para el servidor
            const logChannelId = logsConfig[message.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = message.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            // Envía el log del mensaje eliminado
            const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('🗑️ Mensaje Eliminado')
            .addFields(
                { name: 'Autor', value: message.author?.tag || 'Desconocido', inline: true },
                { name: 'Canal', value: `${message.channel}`, inline: true },
                { name: 'Contenido', value: message.content || 'Sin contenido.', inline: false }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento MessageDelete:', error);
        }
    },
};



