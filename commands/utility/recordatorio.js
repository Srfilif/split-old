const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recordatorio')
        .setDescription('Establece un recordatorio.')
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('Especifica el tiempo para el recordatorio (en minutos, horas, días).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('recordatorio')
                .setDescription('El mensaje del recordatorio.')
                .setRequired(true)),
    async execute(interaction) {
        const time = interaction.options.getString('tiempo');
        const reminder = interaction.options.getString('recordatorio');

        const embed = new EmbedBuilder()
            .setColor(0x34ebba)
            .setTitle('⏰ Recordatorio Establecido')
            .addFields(
                { name: 'Tiempo', value: time, inline: true },
                { name: 'Recordatorio', value: reminder, inline: false }
            )
            .setFooter({ text: `Recordado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Establecer el recordatorio (puedes implementar la lógica con setTimeout o algún sistema de base de datos)
        // Aquí solo se responde con el mensaje, pero no se implementa el temporizador real.
    },
};
