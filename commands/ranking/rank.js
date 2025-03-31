const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserXP, getXpRequired, getUserRank } = require('../../xpsystemv2.js');
const canvacard = require('canvacard');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');  // Importar 'path' para manejar rutas de forma correcta

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu rango en el servidor.'),

  async execute(interaction) {
    const userXP = await getUserXP(interaction.guild.id, interaction.user.id);
    if (!userXP) return interaction.reply("❌ No tienes XP registrado en este servidor.");

    const xpRequerido = getXpRequired(userXP.nivel);
    
    // Llamada para obtener el rank del usuario
    const userRank = await getUserRank(interaction.guild.id, interaction.user.id);

    // Ruta de la imagen del banner
    const bannerPath = path.join(__dirname, '../../assets/images/rankbg.jpg');

    // Genera la tarjeta de rango
    const rank = new canvacard.Rank()
      .setAvatar(interaction.user.displayAvatarURL({ dynamic: true }))
      .setBanner("https://static.vecteezy.com/system/resources/thumbnails/001/225/154/small_2x/black-low-poly-geometric-background.jpg", true)  // Usar la ruta del banner personalizado
      .setCurrentXP(userXP.xp)
      .setBorder(["#22274a", "#001eff"], "vertical")
      .setCreatedTimestamp(interaction.user.createdTimestamp)
      .setRequiredXP(xpRequerido)
      .setRank(userRank.rank, 'RANK', true)  // Añadido rank
      .setLevel(userXP.nivel, 'Nivel')
      .setUsername(interaction.user.username, interaction.user.discriminator, '#FFFFFF')
      .setStatus('online')
      .setProgressBar(['#14C49E', '#FF0000'], 'GRADIENT', true);

    try {
      const data = await rank.build('Cascadia Code PL');

      // Crea el attachment de la tarjeta de rango
      const attachment = new AttachmentBuilder(data, { name: 'RankCard.png' });

      // Crea el embed con los detalles del rango
      const embed = new EmbedBuilder()
        .setTitle(`📊 Rank de ${interaction.user.username}`)
        .setColor('#3498DB')
        .setDescription(`**Nivel:** ${userXP.nivel}\n**XP:** \`${userXP.xp} / ${xpRequerido} XP\`\n**Rango:** #${userRank.rank}`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setImage('attachment://RankCard.png')  // Usar la imagen generada como asset
        .setFooter({ text: '🔹 Rank', iconURL: interaction.guild.iconURL({ dynamic: true }) });

      // Enviar la respuesta con el embed y la imagen generada
      await interaction.reply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (err) {
      console.error('Error creando la tarjeta de rango:', err);
      await interaction.reply('Hubo un error al generar la tarjeta de rango.');
    }
  },

  category: 'XP',
};
