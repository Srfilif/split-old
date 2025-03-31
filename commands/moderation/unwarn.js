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
        .setName('unwarn')
        .setDescription('Elimina una advertencia específica de un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario cuya advertencia quieres eliminar.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('numero')
                .setDescription('El número de advertencia a eliminar (1, 2, 3, etc.).')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const warnNumber = interaction.options.getInteger('numero');
        const guildId = interaction.guild.id;

        let warns = loadWarns();

        if (!warns.guilds[guildId]?.users[user.id]?.warns.length) {
            return interaction.reply({ content: `❌ <@${user.id}> no tiene advertencias registradas.`, ephemeral: true });
        }

        if (warnNumber < 1 || warnNumber > warns.guilds[guildId].users[user.id].warns.length) {
            return interaction.reply({ content: `❌ Número de advertencia inválido. <@${user.id}> tiene ${warns.guilds[guildId].users[user.id].warns.length} advertencias.`, ephemeral: true });
        }

        warns.guilds[guildId].users[user.id].warns.splice(warnNumber - 1, 1);
        saveWarns(warns);

        const embed = new EmbedBuilder()
            .setColor(16734430)
            .setTitle('Moderación - Split BOT')
            .setDescription(`Se ha eliminado la advertencia **#${warnNumber}** de <@${user.id}>.`)
            .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    category: 'Moderación',
};
