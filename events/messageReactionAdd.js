const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) await reaction.fetch();

        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '../data/verificationConfig.json');
        if (!fs.existsSync(configPath)) return;

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (reaction.message.channel.id !== config.channelId || reaction.emoji.name !== '✅') return;

        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        if (!member) return;

        const verifiedRole = guild.roles.cache.get(config.verifiedRoleId);

        if (!verifiedRole) {
            console.error('Rol de verificación no encontrado. Verifica la configuración.');
            return;
        }

        try {
            // Asignar el rol de verificado
            await member.roles.add(verifiedRole);

            await user.send(`¡Felicidades! Ahora estás verificado en **${guild.name}**.`).catch(() => {
                console.log(`No se pudo enviar un mensaje a ${user.tag}.`);
            });
        } catch (error) {
            console.error(`Error al verificar a ${user.tag}:`, error);
        }
    },
};
