const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra ayuda sobre comandos y categorías.')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Especifica un comando para obtener detalles.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('categoría')
                .setDescription('Filtrar por una categoría específica.')
                .setRequired(false)),
    async execute(interaction) {
        const commandsFolder = path.join(__dirname, '../../commands'); // Ruta base de los comandos
        const commands = {};

        // Leer todas las carpetas dentro de "commands"
        const categories = fs.readdirSync(commandsFolder).filter(folder => 
            fs.statSync(path.join(commandsFolder, folder)).isDirectory()
        );

        for (const category of categories) {
            const categoryPath = path.join(commandsFolder, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(path.join(categoryPath, file));
                if (command.data) {
                    // Usar la categoría definida en el comando o el nombre de la carpeta si no está definida
                    const commandCategory = command.category || category;
                    if (!commands[commandCategory]) {
                        commands[commandCategory] = [];
                    }
                    commands[commandCategory].push(command);
                }
            }
        }

        const requestedCommand = interaction.options.getString('comando');
        const selectedCategory = interaction.options.getString('categoría');

        // 📌 Mostrar información detallada de un comando si se solicita
        if (requestedCommand) {
            for (const category in commands) {
                const command = commands[category].find(cmd => cmd.data.name === requestedCommand);
                if (command) {
                    const embed = new EmbedBuilder()
                        .setColor(0x7289da)
                        .setTitle(`Ayuda: /${command.data.name}`)
                        .setDescription(command.data.description)
                        .addFields(
                            { name: 'Uso', value: command.usage || 'No especificado', inline: false },
                            { name: 'Categoría', value: command.category || category, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Split BOT', iconURL: interaction.user.displayAvatarURL() });

                    return interaction.reply({ embeds: [embed] });
                }
            }

            return interaction.reply({
                content: `❌ No se encontró el comando **${requestedCommand}**.`,
                ephemeral: true,
            });
        }

        // 📌 Mostrar comandos de una categoría específica si se solicita
        if (selectedCategory) {
            if (!commands[selectedCategory]) {
                return interaction.reply({
                    content: `❌ No se encontró la categoría **${selectedCategory}**.`,
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x7289da)
                .setTitle(`📂 Comandos en la categoría **${selectedCategory}**`)
                .setDescription(commands[selectedCategory].map(cmd => `\`/${cmd.data.name}\``).join(', '))
                .setTimestamp()
                .setFooter({ text: 'Split BOT', iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        }

        // 📌 Mostrar ayuda general con todas las categorías y sus comandos
        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle('📜 Split - Lista de Comandos')
            .setDescription('Aquí están todos los comandos organizados por categoría.')
            .setTimestamp()
            .setFooter({ text: 'Split BOT', iconURL: interaction.user.displayAvatarURL() });

        for (const [category, commandList] of Object.entries(commands)) {
            embed.addFields({ 
                name: `📂 ${category}`, 
                value: commandList.map(cmd => `\`/${cmd.data.name}\``).join(', '), 
                inline: false 
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
