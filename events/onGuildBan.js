const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        try {
            const logsPath = path.join(__dirname, '../data/logs.json');
            if (!fs.existsSync(logsPath)) return;

            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
            const logChannelId = logsConfig[ban.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = ban.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('⛔ Usuario Baneado')
                .addFields(
                    { name: 'Usuario', value: `${ban.user.tag} (${ban.user.id})`, inline: false },
                    { name: 'Razón', value: ban.reason || 'No especificada', inline: false }
                )
                .setThumbnail(ban.user.displayAvatarURL())
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento GuildBanAdd:', error);
        }
    },
};
