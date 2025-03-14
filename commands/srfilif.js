const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Nos envia unformacion de nuestro creador lindo'),
    async execute(interaction) {
        await interaction.reply('Que lindo que soy!');
    },
    category: 'Utilidad', // Categoría del comando
    private: '928405005646569522', // Guild ID donde se registrará este comando
};
