const { ButtonStyle, ButtonInteraction, EmbedBuilder, Colors } = require("discord.js");
const { NoichuGuildManager } = require("../../../functions/noichu/noichuFunction");
const { NoichuChannelConfig } = require("../../../typings");

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
    const targetChannelId = interaction.message.embeds[0].title.match(/\d+/)[0];

    const channelConfig = new NoichuChannelConfig(targetChannelId, interaction.guildId);

    if (!(await channelConfig.sync())) {
      await interaction.message.delete();
      await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setTitle(`Config has been deleted !`).setColor(Colors.Red)],
      });
      return;
    } else {
      await new NoichuGuildManager().setRepeated(interaction, targetChannelId);
      await channelConfig.sync();
      await interaction.message.edit({ embeds: [channelConfig.createConfigEmbed()] });
    }
  },
};
