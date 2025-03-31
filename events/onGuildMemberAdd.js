const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.GuildMemberAdd,
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
                .setColor('Green')
                .setTitle('✅ Usuario se Unió')
                .addFields(
                    { name: 'Usuario', value: `<@${member.id}> (${member.user.tag})`, inline: false },
                    { name: 'Cuenta Creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento GuildMemberAdd:', error);
        }
    },
};
