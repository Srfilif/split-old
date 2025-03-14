const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const guild = member.guild;

        const configPath = path.join(__dirname, '../data/welcomeConfig.json');
        if (!fs.existsSync(configPath)) {
            return;
        }

        let configData = {};
        try {
            const rawData = fs.readFileSync(configPath, 'utf8');
            configData = JSON.parse(rawData);
        } catch (error) {
            console.error('Error al leer el archivo JSON:', error);
            return;
        }

        const config = configData[guild.id];
        if (!config) {
            return;
        }

        const channel = guild.channels.cache.get(config.channelId);
        if (!channel) {
            return;
        }

        // Crear Canvas
        const canvas = Canvas.createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        const backgroundPath = path.isAbsolute(config.backgroundUrl)
    ? config.backgroundUrl
    : path.join(__dirname, '..', config.backgroundUrl);

let background;
try {
    background = await Canvas.loadImage(backgroundPath);
} catch (error) {
    console.error('Error al cargar la imagen de fondo:', error);
    return; // Salimos del evento si no se puede cargar la imagen
}
ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


        ctx.font = '50px "Whitney", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`${member.user.username}`, canvas.width / 2, 330);

        const welcomeText = config.texto;
        ctx.font = '40px "Whitney", sans-serif';
        ctx.fillStyle = '#FF6F00';
        ctx.fillText(welcomeText, canvas.width / 2, 380);

        const memberCount = `Ahora somos ${guild.memberCount} miembros. ¡Gracias por unirte!`;
        ctx.font = '30px "Whitney", sans-serif';
        ctx.fillStyle = '#21FBA1';
        ctx.fillText(memberCount, canvas.width / 2, 430);

        ctx.beginPath();
        ctx.arc(canvas.width / 2, 150, 128, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#FF6F00';
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.displayAvatarURL({ extension: 'jpg' }));
        ctx.drawImage(avatar, (canvas.width / 2) - 128, 22, 256, 256);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome.png' });

        const embed = new EmbedBuilder()
            .setColor('#FF6F00')
            .setTitle(`**¡Bienvenido/a a ${guild.name}!**`)
            .setDescription(`¡Hola, <@${member.user.id}>! Estamos emocionados de tenerte con nosotros. 🎉`)
            .setImage('attachment://welcome.png')
            .setTimestamp();

        await channel.send({ embeds: [embed], files: [attachment] });
    },
};
