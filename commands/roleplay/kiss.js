const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const dataFile = path.join(__dirname, '../../data/kiss.json');

// Cargar datos de besos
const loadKisses = () => {
    try {
        if (!fs.existsSync(dataFile)) {
            fs.writeFileSync(dataFile, JSON.stringify({}));
        }
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (error) {
        console.error('Error al cargar kiss.json:', error);
        return {};
    }
};

// Guardar datos de besos
const saveKisses = (kisses) => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(kisses, null, 4));
    } catch (error) {
        console.error('Error al guardar kiss.json:', error);
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Envía un beso a otro usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que quieres besar.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const sender = interaction.user;
        const receiver = interaction.options.getUser('usuario');

        if (sender.id === receiver.id) {
            return interaction.reply({ content: 'No puedes besarte a ti mismo... ¿o sí? 🤨', ephemeral: true });
        }

        let kisses = loadKisses();
        const key = `${sender.id}_${receiver.id}`;

        // Incrementar contador de besos
        kisses[key] = (kisses[key] || 0) + 1;
        saveKisses(kisses);

        try {
            const imageResponse = await axios.get('https://nekos.life/api/v2/img/kiss');
            const imageUrl = imageResponse.data.url;

            const embed = new EmbedBuilder()
                .setColor(0xff69b4)
                .setTitle(`**${sender.username}** besó dulcemente a **${receiver.username}** 💋`)
                .setDescription(`${sender} y ${receiver} se han besado **${kisses[key]}** veces.`)
                .setImage(imageUrl)
                .setFooter({ text: '¡Qué romántico! ❤️', iconURL: sender.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error obteniendo la imagen:', error);
            await interaction.reply({ content: 'No pude obtener una imagen de beso en este momento. 😢', ephemeral: true });
        }
    },
    category: 'Divercion',

};
