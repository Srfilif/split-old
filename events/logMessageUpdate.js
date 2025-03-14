const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');



module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        try {
            // Ignorar mensajes fuera de servidores o de bots
            if (!oldMessage.guild || oldMessage.author?.bot) return;

            // Si no hay cambios en el contenido, salir
            if (oldMessage.content === newMessage.content) return;

            // Ruta al archivo de configuración
            const logsPath = path.join(__dirname, '../data/logs.json');
            if (!fs.existsSync(logsPath)) return;

            // Leer configuraciones
            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
            const logChannelId = logsConfig[oldMessage.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            // Crear el embed para mensaje editado
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('✏️ Mensaje editado')
                .setDescription(`Un mensaje fue editado en ${oldMessage.channel}`)
                .addFields(
                    { name: 'Autor', value: oldMessage.author?.tag || 'Desconocido', inline: true },
                    { name: 'Antes', value: oldMessage.content || 'Sin contenido.', inline: false },
                    { name: 'Después', value: newMessage.content || 'Sin contenido.', inline: false }
                )
                .setFooter({ text: `ID del mensaje: ${oldMessage.id}` })
                .setTimestamp();

            // Enviar el embed al canal de logs
            logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento MessageUpdate:', error);
        }
    },
};