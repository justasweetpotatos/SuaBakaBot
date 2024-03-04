const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Return bot Ping")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    const embed = new EmbedBuilder()
      .setTitle(`Pong !`)
      .setColor("Blurple")
      .setTimestamp(interaction.createdTimestamp)
      .addFields([
        {
          name: `**⏱ API Latency:**`,
          value: `\`${client.ws.ping}ms\``,
          inline: true,
        },
        {
          name: `**⏳ Client ping:**`,
          value: `\`${message.createdTimestamp - interaction.createdTimestamp}ms\``,
          inline: true,
        },
      ]);

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
