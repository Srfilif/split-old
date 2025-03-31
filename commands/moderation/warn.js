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
        .setName('warn')
        .setDescription('Advierte a un usuario en el servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a advertir.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de la advertencia.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No especificada';
        const guildId = interaction.guild.id;
        const moderatorId = interaction.user.id;

        let warns = loadWarns();

        // Si la guild no existe en el JSON, la creamos
        if (!warns.guilds[guildId]) {
            warns.guilds[guildId] = { users: {} };
        }

        // Si el usuario no tiene warns, creamos su estructura
        if (!warns.guilds[guildId].users[user.id]) {
            warns.guilds[guildId].users[user.id] = { warns: [] };
        }

        // Generar ID del warn
        const warnId = warns.guilds[guildId].users[user.id].warns.length + 1;

        // Agregar el nuevo warn
        warns.guilds[guildId].users[user.id].warns.push({
            id: warnId,
            moderator: moderatorId,
            reason,
            timestamp: new Date().toISOString()
        });

        saveWarns(warns);

        const embed = new EmbedBuilder()
            .setColor(16734430)
            .setTitle('Moderación - Split BOT')
            .setDescription(`<@${user.id}> ha sido advertido.\n📌 **Razón:** ${reason}`)
            .setFooter({ text: 'Sistema de Moderación - Split BOT', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    category: 'Moderación',
};
