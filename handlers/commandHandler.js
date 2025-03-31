const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs-extra');
const path = require('path');

const handleCommands = async (client) => {
    const commands = [];
    client.commands = new Map(); // Para almacenar los comandos con sus propiedades

    console.log('Leyendo categorías de comandos...');
    const commandCategories = fs.readdirSync('./commands', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`Categorías encontradas: ${commandCategories.join(', ')}`);

    for (const category of commandCategories) {
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));
        console.log(`Comandos encontrados en ${category}: ${commandFiles.join(', ')}`);

        for (const file of commandFiles) {
            try {
                const commandPath = path.join(__dirname, `../commands/${category}/${file}`);
                console.log(`Cargando comando: ${commandPath}`);
                const command = require(commandPath);
                
                if (!command.data || !command.data.name) {
                    console.warn(`⚠️ El comando [${file}] no tiene 'data' o 'name' definidos. Se omitirá.`);
                    continue;
                }
                
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command); // Guarda el comando en el cliente
                console.log(`✅ Comando [${file}] Cargado con Éxito.`);
            } catch (error) {
                console.error(`❌ No se pudo cargar el comando [${file}]:`, error);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Iniciando registro de comandos...');

        // Comandos globales (sin atributo 'private')
        const globalCommands = commands.filter(command => !command.private);
        if (globalCommands.length > 0) {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: globalCommands }
            );
            console.log('✅ Comandos globales registrados exitosamente.');
        }

        // Comandos privados (con atributo 'private' y guild_id)
        const privateCommands = commands.filter(command => command.private);
        if (privateCommands.length > 0) {
            for (const command of privateCommands) {
                const guildId = command.private; // Guild ID específica del comando
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                    { body: [command] }
                );
                console.log(`✅ Comando privado registrado en la guild ${guildId} exitosamente.`);
            }
        }
    } catch (error) {
        console.error('❌ Error al registrar los comandos:', error);
    }

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            // Verifica si el comando es privado y si se está ejecutando en la guild correcta
            if (command.private && interaction.guild.id !== command.private) {
                await interaction.reply({
                    content: `Este comando es exclusivo de un servidor 🔒.`,
                    ephemeral: true
                });
                return;
            }

            // Ejecuta el comando si pasa la validación
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    });
};

module.exports = { handleCommands };
