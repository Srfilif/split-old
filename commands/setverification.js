const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverification')
        .setDescription('Configura el sistema de verificación.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('El canal donde los usuarios se verificarán.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('verifiedrole')
                .setDescription('El rol que se dará al verificarse. Si no se selecciona, se creará uno.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Diferir la interacción

        const channel = interaction.options.getChannel('channel');
        let verifiedRole = interaction.options.getRole('verifiedrole');

        // Crear el rol si no se selecciona uno
        if (!verifiedRole) {
            try {
                verifiedRole = await interaction.guild.roles.create({
                    name: 'Verificado',
                    color: 'Green',
                    reason: 'Creado automáticamente para el sistema de verificación.',
                });

                await interaction.followUp({
                    content: `No se seleccionó un rol. Se ha creado el rol **${verifiedRole.name}** para el sistema de verificación.`,
                });
            } catch (error) {
                console.error('Error al crear el rol:', error);
                return interaction.editReply({
                    content: 'No se pudo crear el rol automáticamente. Asegúrate de que tengo permisos para gestionar roles.',
                });
            }
        }

        // Guardar configuración en un archivo JSON
        const configPath = path.join(__dirname, '../data/verificationConfig.json');
        const configData = {
            guildId: interaction.guild.id,
            channelId: channel.id,
            verifiedRoleId: verifiedRole.id,
        };

        try {
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
            return interaction.editReply({
                content: 'No se pudo guardar la configuración. Verifica los permisos de escritura del bot.',
            });
        }

        // Crear mensaje de verificación
        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle('Sistema de Verificación')
            .setDescription('Reacciona a este mensaje con ✅ para verificarte y obtener acceso completo al servidor.')
            .setFooter({ text: 'Split BOT - Sistema de Verificación', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        try {
            const verifyMessage = await channel.send({ embeds: [embed] });

            // React al mensaje para iniciar el proceso de verificación
            await verifyMessage.react('✅');

            await interaction.editReply({
                content: `Sistema de verificación configurado correctamente en ${channel}.`,
            });
        } catch (error) {
            console.error('Error al enviar el mensaje de verificación:', error);
            await interaction.editReply({
                content: 'No se pudo enviar el mensaje de verificación. Verifica los permisos del bot en el canal.',
            });
        }
    },
    category: 'Configuración',
    usage: '/setverification [channel] [verifiedrole]',
};
