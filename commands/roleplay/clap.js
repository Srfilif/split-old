const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clap')
        .setDescription('Aplaude con un GIF animado.'),
    async execute(interaction) {
        try {
            const response = await axios.get('https://nekos.best/api/v2/clap');
            const { url, anime_name, artist_href, artist_name } = response.data.results[0];

            const embed = new EmbedBuilder()
                .setColor(0xFFC0CB)
                .setTitle('👏 ¡Aplausos!')
                .setDescription(`Un aplauso desde **${anime_name}**`)
                .setImage(url)
                .setFooter({ text: `Arte por: ${anime_name}`, iconURL: interaction.user.displayAvatarURL() });

            if (artist_href) embed.setURL(artist_href);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ocurrió un error al obtener la imagen.', ephemeral: true });
        }
    },
};
