require("dotenv").config({ path: "./config/config.env" });
const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} = require("discord.js");
const fs = require("fs-extra");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
});

// Cargar handlers
const { handleCommands } = require("./handlers/commandHandler");
const { handleEvents } = require("./handlers/eventHandler");
const { privateCommandHandler } = require('./handlers/privateCommandHandler');

handleCommands(client);
handleEvents(client);

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  // Configurar estado del bot
  client.user.setPresence({
    activities: [
      {
        name: "tus comandos | /help",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });
});

client.login(process.env.DISCORD_TOKEN);
