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
        // Cargar los comandos desde la carpeta de comandos
        const commandsFolder = path.join(__dirname, '../commands'); // Ajusta según tu estructura de carpetas
        const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));

        const commands = {};
        for (const file of commandFiles) {
            const command = require(path.join(commandsFolder, file));
            commands[command.data.name] = command;
        }

        const requestedCommand = interaction.options.getString('comando');
        const selectedCategory = interaction.options.getString('categoría');

        // Si se proporciona un comando, mostrar detalles del comando
        if (requestedCommand) {
            const command = commands[requestedCommand];
            if (!command) {
                return interaction.reply({
                    content: `No se encontró el comando **${requestedCommand}**.`,
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x7289da)
                .setTitle(`Ayuda: /${command.data.name}`)
                .setDescription(command.data.description)
                .addFields(
                    { name: 'Uso', value: command.usage || 'No especificado', inline: false },
                    { name: 'Categoría', value: command.category || 'Sin Categoría', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Split BOT', iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        }

        // Si no se proporciona un comando, mostrar ayuda general por categorías
        const categories = {};

        for (const command of Object.values(commands)) {
            const category = command.category || 'Sin Categoría';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command.data.name);
        }

        if (selectedCategory && !categories[selectedCategory]) {
            return interaction.reply({
                content: `No se encontró la categoría **${selectedCategory}**.`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x7289da)
            .setTitle('Split - Lista de Comandos')
            .setDescription(
                selectedCategory
                    ? `Comandos en la categoría **${selectedCategory}**:`
                    : 'Aquí están todos los comandos organizados por categoría.'
            )
            .setTimestamp()
            .setFooter({ text: 'Split BOT', iconURL: interaction.user.displayAvatarURL() });

        const categoriesToDisplay = selectedCategory
            ? { [selectedCategory]: categories[selectedCategory] }
            : categories;

        for (const [category, commandNames] of Object.entries(categoriesToDisplay)) {
            embed.addFields({ name: category, value: commandNames.join(', '), inline: false });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
