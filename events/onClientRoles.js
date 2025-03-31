const { Events, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        try {
            const logsPath = path.join(__dirname, '../data/logs.json');

            if (!fs.existsSync(logsPath)) return;

            const logsConfig = JSON.parse(fs.readFileSync(logsPath, 'utf8'));

            const logChannelId = logsConfig[newMember.guild.id]?.logChannelId;
            if (!logChannelId) return;

            const logChannel = newMember.guild.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const oldRoles = new Set(oldMember.roles.cache.keys());
            const newRoles = new Set(newMember.roles.cache.keys());

            const addedRoles = [...newRoles].filter(role => !oldRoles.has(role));
            const removedRoles = [...oldRoles].filter(role => !newRoles.has(role));

            if (addedRoles.length === 0 && removedRoles.length === 0) return;

            const embed = new EmbedBuilder()
                .setColor('Purple')
                .setTitle('🔄 Cambio de Roles')
                .setDescription(`${newMember.user.tag} ha actualizado sus roles.`)
                .setTimestamp();

            if (addedRoles.length > 0) {
                embed.addFields({ 
                    name: 'Roles Añadidos', 
                    value: addedRoles.map(roleId => `<@&${roleId}>`).join(', '), 
                    inline: false 
                });
            }

            if (removedRoles.length > 0) {
                embed.addFields({ 
                    name: 'Roles Eliminados', 
                    value: removedRoles.map(roleId => `<@&${roleId}>`).join(', '), 
                    inline: false 
                });
            }

            embed.addFields(
                { name: 'Usuario', value: `<@${newMember.id}>`, inline: true },
                { name: 'ID Usuario', value: newMember.id, inline: true }
            );

            logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error en el evento GuildMemberUpdate:', error);
        }
    },
};
