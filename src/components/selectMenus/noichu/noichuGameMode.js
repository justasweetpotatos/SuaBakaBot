const { ChannelType, Client } = require("discord.js");

module.exports = {
  data: {
    customId: `noichu-game-mode`,
    placeholder: `Chọn chế độ chơi cho game nối chữ !`,
    channelType: ChannelType.GuildText,
    options: [
      {
        label: "Cho phép lặp từ.",
        description: "any",
        value: `1`,
      },
    ],
  },

  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    console.log(interaction);
  },
};
