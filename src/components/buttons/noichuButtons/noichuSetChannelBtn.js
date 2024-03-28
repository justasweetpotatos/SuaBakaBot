const { ButtonStyle, Client } = require("discord.js");
const { NoichuGuildManagerSystem } = require("../../../functions/noichu/manager");

module.exports = {
  data: {
    customId: `noichu-set-btn`,
    label: `Xác nhận`,
    buttonStyle: ButtonStyle.Success,
  },
  /**
   *
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {Client} client
   * @param {*} execute
   */
  async execute(interaction, client) {
    const embedTitle = interaction.message.embeds[0]?.title;
    const targetChannelId = embedTitle.match(/\d+/)[0];
    const channel = await interaction.guild.channels.fetch(targetChannelId);
    await new NoichuGuildManagerSystem(interaction.guild).setChannel(interaction, channel);
  },
};
