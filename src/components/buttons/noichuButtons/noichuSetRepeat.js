const { ButtonStyle, ButtonInteraction } = require("discord.js");
const { NoichuChannelManager } = require("../../../functions/noichu/manager");

module.exports = {
  data: {
    customId: `noichu-set-repeat`,
    label: `Set Repeat`,
    buttonStyle: ButtonStyle.Primary,
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const interactionEmbed = interaction.message.embeds[0];
    const targetChannel = await interaction.guild.channels.fetch(interactionEmbed.title.match(/\d+/)[0]);
    const channelManager = new NoichuChannelManager(interaction.guild, targetChannel);

    if (!(await channelManager.setRepeated(interaction))) {
      await interaction.message.delete();
      return;
    }
  },
};
