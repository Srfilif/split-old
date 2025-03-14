const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('banana')
        .setDescription('Que tanto me mide la banana?!'),
        async execute(interaction) {
            const embed = new EmbedBuilder()
                .setTitle('🍌 Evaluación de la banana de SrFilif')
                .setDescription('La banana de SrFilif mide **'+ Math.ceil(Math.random(1,30)) +'cm**. ')
                .setImage('https://cdn.nekotina.com/res/menus/banana.png') // Reemplaza con la URL de la imagen.
                .setColor(0xffff00);
    
            await interaction.reply({ embeds: [embed] });
        },
    category: 'Divercion', // Categoría del comando
};

