const { ButtonStyle } = require("discord.js");
const { NoichuGuildManager } = require("../../../functions/noichu/manager");

module.exports = {
  data: {
    customId: `noichu-confirm-remove-channel-btn`,
    label: `Confirm`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {*} client
   * @returns
   */
  async execute(interaction, client) {
    const channel = await interaction.guild.channels.fetch(
      interaction.message.embeds[0].title.match(/\d+/)[0]
    );
    await new NoichuGuildManager(interaction.guild).unsetChannel(interaction, channel);
  },
};
