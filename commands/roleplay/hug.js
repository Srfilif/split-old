const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Abrazas a alguien con un GIF.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a quien quieres abrazar.')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const response = await axios.get('https://nekos.best/api/v2/hug');
            const { url, anime_name, artist_href, artist_name } = response.data.results[0];

            const targetUser = interaction.options.getUser('usuario');
            const description = targetUser 
                ? `<@${interaction.user.id}> abraza a <@${targetUser.id}> 🤗` 
                : `${interaction.user.username} necesita un abrazo 🤗`;

            const embed = new EmbedBuilder()
                .setColor(0xFFC0CB)
                .setTitle('🤗 ¡Abrazo!')
                .setDescription(description)
                .setImage(url)
                .setFooter({ text: `Anime: ${anime_name}`, iconURL: interaction.user.displayAvatarURL() });

            if (artist_href) embed.setURL(artist_href);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ocurrió un error al obtener la imagen.', ephemeral: true });
        }
    },
};
