const { ButtonStyle, Client, EmbedBuilder, Colors } = require("discord.js");
const { setChannel } = require("../../../functions/noichu/noichuFunction");
const { getNoichuChannelConfig } = require("../../../database/guildData");
const { NoichuChannelConfig } = require("../../../typings");

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
    const channelId = embedTitle.match(/\d+/)[0];

    const channelConfig = new NoichuChannelConfig({}, channelId, interaction.guildId);

    if (await channelConfig.sync()) {
      const embed = new EmbedBuilder()
        .setTitle(`Bạn đã set kênh này rồi, vui lòng chọn kênh khác !`)
        .setColor(Colors.Yellow);
      const message = await interaction.reply({ embeds: [embed] });
      setTimeout(async () => {
        await message.delete();
      }, 5000);
      return;
    }

    await setChannel(interaction, channelId);
  },
};
