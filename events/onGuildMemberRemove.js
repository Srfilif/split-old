const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const logsPath = path.join(__dirname, '../data/logs.json');
            if (!fs.existsSync(logsPath)) return;

            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
            const logChannelId = logsConfig[member.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = member.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('📤 Usuario Expulsado')
                .addFields(
                    { name: 'Usuario', value: `${member.user.tag} (${member.user.id})`, inline: false }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento GuildMemberRemove:', error);
        }
    },
};
