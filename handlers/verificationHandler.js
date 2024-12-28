const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) await reaction.fetch();

        const configPath = path.join(__dirname, '../data/verificationConfig.json');
        if (!fs.existsSync(configPath)) return;

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (reaction.message.channel.id !== config.channelId || reaction.emoji.name !== '✅') return;

        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        if (!member) return;

        const defaultRole = guild.roles.cache.get(config.defaultRoleId);
        const verifiedRole = guild.roles.cache.get(config.verifiedRoleId);

        if (!defaultRole || !verifiedRole) return;

        try {
            // Eliminar rol por defecto y asignar el rol de verificado
            if (member.roles.cache.has(defaultRole.id)) {
                await member.roles.remove(defaultRole);
            }
            await member.roles.add(verifiedRole);

            // Notificar al usuario
            const dmMessage = `¡Felicidades, ${user.username}! Has sido verificado en el servidor **${guild.name}**.`;
            await user.send(dmMessage).catch(() => {
                console.log(`No se pudo enviar un mensaje directo a ${user.username}.`);
            });
        } catch (error) {
            console.error('Error al asignar roles:', error);
        }
    },
};
