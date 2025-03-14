const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        try {
            const { member, guild } = newState;

            // Ignorar si no es un servidor
            if (!guild) return;

            // Ruta al archivo de configuración
            const logsPath = path.join(__dirname, '../data/logs.json');
            if (!fs.existsSync(logsPath)) return;

            // Leer configuraciones
            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
            const logChannelId = logsConfig[guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            let embed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setTimestamp();

            // Detectar conexión y desconexión
            if (!oldState.channel && newState.channel) {
                embed.setTitle('🔊 Se unió a un canal de voz')
                     .setDescription(`${member} se unió a **${newState.channel.name}**`);
            } else if (oldState.channel && !newState.channel) {
                embed.setTitle('🔇 Salió de un canal de voz')
                     .setDescription(`${member} salió de **${oldState.channel.name}**`);
            } 
            // Detectar cambio de canal
            else if (oldState.channelId !== newState.channelId) {
                embed.setTitle('🔄 Cambió de canal de voz')
                     .setDescription(`${member} se movió de **${oldState.channel.name}** a **${newState.channel.name}**`);
            }

            // Detectar muteo/desmuteo
            if (!oldState.selfMute && newState.selfMute) {
                embed.setTitle('🔕 Usuario muteado')
                     .setDescription(`${member} se ha muteado a sí mismo.`);
            } else if (oldState.selfMute && !newState.selfMute) {
                embed.setTitle('🔔 Usuario desmuteado')
                     .setDescription(`${member} se ha desmuteado.`);
            }

            // Detectar ensordecimiento/desensordecimiento
            if (!oldState.selfDeaf && newState.selfDeaf) {
                embed.setTitle('🚫 Usuario ensordecido')
                     .setDescription(`${member} se ha ensordecido.`);
            } else if (oldState.selfDeaf && !newState.selfDeaf) {
                embed.setTitle('🔊 Usuario desensordecido')
                     .setDescription(`${member} se ha desensordecido.`);
            }

            // Enviar log si hubo un cambio relevante
            if (embed.data.title) logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error en el evento VoiceStateUpdate:', error);
        }
    },
};
