const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs-extra');

const privateCommandHandler = async (client) => {
    const commands = [];
    client.commands = new Map(); // Para almacenar los comandos con sus propiedades
    const privateCommands = [];

    const commandFiles = fs.readdirSync('./commandsp').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commandsp/${file}`);
        
        // Asegurarse de que 'private' esté definido como un array
        if (Array.isArray(command.private)) {
            privateCommands.push(command);
        } else {
            console.log(`El comando ${command.data.name} no tiene la propiedad 'private' como un array.`);
        }

        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command); // Guarda el comando en el cliente
    }

    // Filtrar los comandos privados que solo estarán disponibles en las guilds configuradas
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Iniciando registro de comandos...');
        // Registrar solo los comandos privados para las guilds configuradas
        for (const command of privateCommands) {
            for (const guildId of command.private) {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                    { body: [command.data.toJSON()] }
                );
                console.log(`Comando privado registrado en la guild ${guildId}: ${command.data.name}`);
            }
        }

        console.log('Comandos privados registrados exitosamente.');
    } catch (error) {
        console.error('Error al registrar los comandos privados:', error);
    }

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            if (command.private && !command.private.includes(interaction.guildId)) {
                return interaction.reply({ content: 'Este comando no está disponible en esta guild.', ephemeral: true });
            }
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    });
};

module.exports = { privateCommandHandler };
