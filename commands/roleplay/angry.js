const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('angry')
        .setDescription('Muestra que estás enojado con un GIF.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario con el que estás enojado.')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario'); // Usuario mencionado
            const user = interaction.user; // Usuario que ejecutó el comando

            const response = await axios.get('https://nekos.best/api/v2/angry');
            const { url, anime_name } = response.data.results[0];

            let description;
            if (targetUser) {
                description = `😡 **${user.username}** se enojó con **${targetUser.username}**`;
            } else {
                description = `😡 **${user.username}**, se enojó 😢`;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('¡Alguien está enojado! 😡')
                .setDescription(description)
                .setImage(url)
                .setFooter({ text: `Anime: ${anime_name}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ocurrió un error al obtener la imagen.', ephemeral: true });
        }
    },
};
