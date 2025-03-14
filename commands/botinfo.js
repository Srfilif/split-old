const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Muestra información detallada del bot.'),
    async execute(interaction) {
        const client = interaction.client;

        // Utilidades para formatear memoria, duración y OS
        const formatBytes = (bytes) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
        };

        const parseDuration = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        const formatOS = {
            win32: 'Windows',
            linux: 'Linux',
            darwin: 'macOS'
        };
// Obtén el número total de usuarios únicos en los servidores del bot
const totalUsuarios = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

// Formatea el número con toLocaleString()
const totalUsuariosFormateado = totalUsuarios.toLocaleString();

// Muestra el resultado

        // Embed personalizado
        const embed = new EmbedBuilder()
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(5814783)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
            .setTimestamp()
            .setTitle('Información del Bot')
            .addFields(
                {
                    name: '<:docs:1180170919700873316> General ❯',
                    value: `
> **🏷️ Nombre del bot:** \`${client.user.tag}\`
> **📇 Bot ID:** \`${client.user.id}\`
> **👑 Owner:** \`SrFilif\`
> **🌐 Servers:** \`${client.guilds.cache.size.toLocaleString()}\` Servers
> **👥 Usuarios:** \`${totalUsuariosFormateado}\` Usuarios
> **📺 Canales:** \`${client.channels.cache.size.toLocaleString()}\` Canales
> **📅 Creado:** \`${moment(client.user.createdTimestamp).format('DD/MM/YYYY, h:mm:ss A')}\`
> **⌛ Hace:** \`${Math.floor((Date.now() - client.user.createdTimestamp) / 86400000)}\` días
\u200b
                    `,
                },
                {
                    name: '<:docs:1180170919700873316> Sistema ❯',
                    value: `
> **<a:online:1312546538697920693> Uptime:** \`${parseDuration(client.uptime)}\`
> **<:node:1180170917016518687> Node.js:** \`${process.version}\`
> **<:discordjs:1312546076653522964> Discord.js:** \`v14.x.x\`
> **🖥 Plataforma:** \`${formatOS[os.platform()] || 'Desconocido'}\`
> **📊 Memoria:** \`${formatBytes(process.memoryUsage().heapUsed)} / ${formatBytes(process.memoryUsage().heapTotal)}\`
> **💻 CPU:** \`${os.cpus()[0].model}\`
                    `
                }
            );

        await interaction.reply({ embeds: [embed] });
    },
    category: 'Información',
};
