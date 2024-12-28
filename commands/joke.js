const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Cuenta un chiste.'),
    async execute(interaction) {
        try {
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const joke = response.data;

            await interaction.reply(`${joke.setup}\n\n||${joke.punchline}||`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'No pude obtener un chiste en este momento. Intenta de nuevo más tarde.', ephemeral: true });
        }
    },
};
