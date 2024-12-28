const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Responde preguntas al estilo de una bola mágica.')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('Escribe tu pregunta.')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('pregunta');
        const responses = [
            'Sí.',
            'No.',
            'Tal vez.',
            'Definitivamente sí.',
            'Definitivamente no.',
            'Es poco probable.',
            'Probablemente.',
            'Pregunta más tarde.',
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle('🎱 Bola Mágica')
            .addFields(
                { name: 'Pregunta', value: question, inline: false },
                { name: 'Respuesta', value: randomResponse, inline: false }
            )
            .setFooter({ text: `Pregunta respondida por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
