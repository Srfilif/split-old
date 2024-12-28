const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Envía un meme aleatorio.'),
    async execute(interaction) {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const meme = response.data;

            const embed = new EmbedBuilder()
                .setColor(0x7289da)
                .setTitle(meme.title)
                .setImage(meme.url)
                .setFooter({ text: `Subreddit: ${meme.subreddit}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'No pude obtener un meme en este momento. Intenta de nuevo más tarde.', ephemeral: true });
        }
    },
};
