const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');


const fs = require('fs');
const path = require('path');

const warnsPath = path.resolve(__dirname, '../../data/warns.json');

// Función para cargar el archivo de warns
function loadWarns() {
    if (!fs.existsSync(warnsPath)) return { guilds: {} };
    return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

// Función para guardar el archivo de warns
function saveWarns(warns) {
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 4), 'utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Elimina todas las advertencias de un usuario en este servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario cuyas advertencias quieres eliminar.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;

        let warns = loadWarns();

        if (!warns.guilds[guildId]?.users[user.id]) {
            return interaction.reply({ content: `✅ <@${user.id}> no tiene advertencias registradas.`, ephemeral: true });
        }

        delete warns.guilds[guildId].users[user.id];
        saveWarns(warns);

        const embed = new EmbedBuilder()
            .setColor(16734430)
            .setTitle('Moderación - Split BOT')
            .setDescription(`Todas las advertencias de <@${user.id}> han sido eliminadas.`)
            .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    category: 'Moderación',
};
