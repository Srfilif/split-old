const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const warnsFile = './warns.json';

function loadWarns() {
    if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, '{}');
    return JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
}

function saveWarns(data) {
    fs.writeFileSync(warnsFile, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Elimina todas las advertencias de un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a limpiar advertencias').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const warns = loadWarns();

        if (!warns[user.id] || warns[user.id].length === 0) {
            return interaction.reply({ content: `🚫 <@${user.id}> no tiene advertencias.`, ephemeral: true });
        }

        delete warns[user.id];
        saveWarns(warns);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Advertencias eliminadas')
            .setDescription(`Todas las advertencias de <@${user.id}> han sido eliminadas.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    category: 'Moderación',
};
