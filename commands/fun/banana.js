const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banana")
    .setDescription("Que tanto me mide la banana?!"),

  async execute(interaction) {
    const sender = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`🍌 Evaluación de la banana de ${sender.username}`)
      .setDescription(
        "La banana de SrFilif mide **" + getRandomInt(1, 30) + "cm**. "
      )
      .setImage("https://cdn.nekotina.com/res/menus/banana.png") // Reemplaza con la URL de la imagen.
      .setColor(0xffff00);

    await interaction.reply({ embeds: [embed] });
  },
  category: "Divercion", // Categoría del comando
};

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
