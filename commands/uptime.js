const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Muestra cuánto tiempo lleva en línea el bot.'),
    async execute(interaction) {
        const uptime = process.uptime(); // Obtiene el tiempo de actividad en segundos
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle('Tiempo en línea')
            .setDescription(`He estado en línea durante:\n**${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos**.`)
            .setFooter({ text: 'Split BOT - Sistema', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
