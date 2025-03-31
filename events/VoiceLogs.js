const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        try {
            const logsPath = path.join(__dirname, '../data/logs.json');

            if (!fs.existsSync(logsPath)) return;

            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));

            const logChannelId = logsConfig[newState.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = newState.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            let embed = new EmbedBuilder().setColor('Blue').setTimestamp();

            if (!oldState.channel && newState.channel) {
                embed.setTitle('🔊 Usuario Entró a un Canal de Voz')
                    .addFields(
                        { name: 'Usuario', value: newState.member.user.tag, inline: true },
                        { name: 'Canal', value: newState.channel.name, inline: true }
                    );
            } else if (oldState.channel && !newState.channel) {
                embed.setTitle('📤 Usuario Salió de un Canal de Voz')
                    .addFields(
                        { name: 'Usuario', value: oldState.member.user.tag, inline: true },
                        { name: 'Canal', value: oldState.channel.name, inline: true }
                    );
            } else if (oldState.channelId !== newState.channelId) {
                embed.setTitle('🔄 Usuario Cambió de Canal de Voz')
                    .addFields(
                        { name: 'Usuario', value: newState.member.user.tag, inline: true },
                        { name: 'Desde', value: oldState.channel.name, inline: true },
                        { name: 'Hasta', value: newState.channel.name, inline: true }
                    );
            } else if (!oldState.streaming && newState.streaming) {
                embed.setTitle('📺 Usuario Comenzó a Compartir Pantalla')
                    .addFields(
                        { name: 'Usuario', value: newState.member.user.tag, inline: true },
                        { name: 'Canal', value: newState.channel.name, inline: true }
                    );
            } else if (oldState.streaming && !newState.streaming) {
                embed.setTitle('⏹️ Usuario Dejó de Compartir Pantalla')
                    .addFields(
                        { name: 'Usuario', value: newState.member.user.tag, inline: true },
                        { name: 'Canal', value: newState.channel.name, inline: true }
                    );
            }

            if (embed.data.title) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error en el evento VoiceStateUpdate:', error);
        }
    },
};
