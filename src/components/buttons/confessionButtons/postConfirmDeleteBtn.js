const { ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const logger = require("../../../utils/logger");
const { ConfessionPost } = require("../../../functions/confessionSystem/ConfessionFunction");

module.exports = {
  data: {
    customId: `confession-post-confirm-delete-btn`,
    label: `Confirm`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const postId = interaction.message.embeds[0].title.match(/\d+/)[0];
      const guildId = interaction.channel.guildId;
      const post = new ConfessionPost(postId, "", "", guildId);
      await post.reSync();

      const postChannel = interaction.guild.channels.cache.get(postId);
      await postChannel.delete();
      await post.delete();
    } catch (error) {
      logger.errors.component(`Error on executing event button ${this.data.customId}: ${error}`);
    }
  },
};
