const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Envía un chiste aleatorio en español.'),

    async execute(interaction) {
        await interaction.deferReply(); // Responde de manera diferida para evitar timeouts

        try {
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=es');
            const joke = response.data;

            if (!joke || (!joke.joke && (!joke.setup || !joke.delivery))) {
                throw new Error('No se pudo obtener un chiste válido.');
            }

            let jokeText;
            if (joke.type === 'twopart') {
                jokeText = `**${joke.setup}**\n\n${joke.delivery}`;
            } else {
                jokeText = joke.joke;
            }

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('😂 ¡Aquí tienes un chiste! 😂')
                .setDescription(jokeText)
                .setFooter({ text: `Categoría: ${joke.category}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            
            const embedError = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error al obtener un chiste')
                .setDescription('No pude obtener un chiste en este momento. Intenta de nuevo más tarde.')
                .setFooter({ text: 'Error en la API', iconURL: interaction.user.displayAvatarURL() });

            await interaction.editReply({ embeds: [embedError] });
        }
    },
};
