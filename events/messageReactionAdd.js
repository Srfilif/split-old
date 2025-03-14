const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        try {
            if (reaction.partial) await reaction.fetch();

            // Ruta al archivo de configuración
            const configPath = path.join(__dirname, '../data/verificationConfig.json');

            if (!fs.existsSync(configPath)) {
                console.error('El archivo de configuración no existe en la ruta especificada.');
                return;
            }

            // Leer la configuración
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            // Verificar si la reacción y el canal coinciden con la configuración
            if (reaction.message.channel.id !== config.channelId || reaction.emoji.name !== '✅') return;

            const guild = reaction.message.guild;
            const member = guild.members.cache.get(user.id);

            if (!member) return;

            const verifiedRole = guild.roles.cache.get(config.verifiedRoleId);

            if (!verifiedRole) {
                console.error('Rol de verificación no encontrado. Verifica la configuración.');
                return;
            }

            // Asignar el rol al usuario
            await member.roles.add(verifiedRole);

            // Intentar enviar un mensaje al usuario
            try {
                await user.send(`¡Felicidades! Ahora estás verificado en **${guild.name}**.`);
            } catch {
                console.log(`No se pudo enviar un mensaje directo a ${user.tag}.`);
            }

            console.log(`Usuario ${user.tag} verificado y rol asignado.`);
        } catch (error) {
            console.error(`Error al procesar la reacción de verificación:`, error);
        }
    },
};
