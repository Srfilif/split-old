const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas'); // Asegúrate de instalar este paquete
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Prueba el sistema de bienvenida enviando un mensaje.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario para probar la bienvenida.')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.options.getUser('usuario') || interaction.user;
        const guild = interaction.guild;

        // Verificar si hay un canal configurado
        const configPath = path.join(__dirname, '../data/welcomeConfig.json');
        if (!fs.existsSync(configPath)) {
            return interaction.editReply({
                content: 'No se ha configurado un canal de bienvenida. Usa `/setwelcome` para configurarlo primero.',
            });
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const channel = guild.channels.cache.get(config.channelId);
        if (!channel) {
            return interaction.editReply({
                content: 'El canal configurado ya no existe. Usa `/setwelcome` para configurarlo nuevamente.',
            });
        }

        // Crear Canvas
        const canvas = Canvas.createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        // Fondo
        const background = await Canvas.loadImage('https://i.imgur.com/umLOhA3.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
         // Nombre de Usuario
         ctx.font = '50px "Whitney", sans-serif';
         ctx.fillStyle = '#FFFFFF';
         ctx.textAlign = 'center';
         ctx.fillText(`${member.username}`, canvas.width / 2, 330);
 
         // Texto 1
         ctx.font = '40px "Whitney", sans-serif';
         ctx.fillStyle = '#FF6F00';
         ctx.fillText('¡Bienvenido al servidor!', canvas.width / 2, 380);
 
         // Texto 2
         const memberCount = `Ahora somos ${guild.memberCount} miembros. ¡Gracias por unirte!`;
         ctx.font = '30px "Whitney", sans-serif';
         ctx.fillStyle = '#21FBA1';
         ctx.fillText(memberCount, canvas.width / 2, 430);

        // Círculo para Avatar (centrado)
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 150, 128, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#FF6F00';
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        // Avatar (centrado)
        const avatar = await Canvas.loadImage(member.displayAvatarURL({ extension: 'jpg' }));
        ctx.drawImage(avatar, (canvas.width / 2) - 128, 22, 256, 256);

       

        // Guardar Imagen
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome.png' });

        // Crear Embed
        const embed = new EmbedBuilder()
            .setColor('#FF6F00')
            .setTitle('¡Bienvenido/a a la comunidad!')
            .setDescription(`¡Hola, ${member.username}! Estamos emocionados de tenerte con nosotros. 🎉`)
            .setImage('attachment://welcome.png')
            .setTimestamp();

        // Enviar Bienvenida al Canal Configurado
        await channel.send({ embeds: [embed], files: [attachment] });

        // Confirmar al usuario que se realizó la prueba
        await interaction.editReply({
            content: `Prueba de bienvenida enviada al canal ${channel}.`,
        });
    },
};
