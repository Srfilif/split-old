const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Envía una reacción con una imagen animada.')
        .addStringOption(option => 
            option.setName('tipo')
                .setDescription('Elige una reacción')
                .setRequired(true)
                .addChoices(
                    { name: 'Beso 💋', value: 'kiss' },
                    { name: 'Enojado 😡', value: 'angry' },
                    { name: 'Abrazo 🤗', value: 'hug' },
                    { name: 'Bofetada 👋', value: 'slap' }
                )
        )
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres reaccionar')
                .setRequired(true)
        ),

    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        const user = interaction.options.getUser('usuario');

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: '¡No puedes hacer esto contigo mismo! 🙃', ephemeral: true });
        }

        // URLs de la API de Nekos para cada reacción
        const apiUrls = {
            kiss: 'https://nekos.life/api/v2/img/kiss',
            angry: 'https://nekos.life/api/v2/img/angry',
            hug: 'https://nekos.life/api/v2/img/hug',
            slap: 'https://nekos.life/api/v2/img/slap',
        };

        const mensajes = {
            kiss: `${interaction.user} besó a ${user} 💋`,
            angry: `${interaction.user} está enojado con ${user} 😡`,
            hug: `${interaction.user} abrazó a ${user} 🤗`,
            slap: `${interaction.user} abofeteó a ${user} 👋`,
        };

        try {
            const response = await axios.get(apiUrls[tipo]);
            const imageUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor(0xff66b2)
                .setTitle(`¡${tipo.charAt(0).toUpperCase() + tipo.slice(1)}!`)
                .setDescription(mensajes[tipo])
                .setImage(imageUrl)
                .setFooter({ text: 'Reacción anime ❤️', iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error obteniendo imagen de reacción (${tipo}):`, error);
            await interaction.reply({ content: 'No pude obtener una imagen en este momento. Intenta más tarde.', ephemeral: true });
        }
    },
};
