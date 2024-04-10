const { Role, ButtonStyle, CommandInteraction, EmbedBuilder, Colors, ButtonBuilder } = require("discord.js");

module.exports = {
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {String} messageId
   * @param {Role} role
   * @param {String} emoji
   * @param {String} ButtonStyle
   */
  async add(interaction, messageId, role, emojiId, buttonStyleOption) {
    await interaction.deferReply({ fetchReply: true });

    let continue_ = true;

    const channelTarget = interaction.channel;
    const messageTarget = await channelTarget.messages.fetch(messageId);

    if (!messageTarget) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thất bại !`)
            .setDescription(`*Id tin nhắn không hợp lệ !*`)
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    const emojiManager = interaction.guild.emojis;
    const emoji = emojiManager.fetch(emojiId.match(/\d+/)[0]);
    if (!emoji) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thất bại !`)
            .setDescription(`*Id tin nhắn không hợp lệ !*`)
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    let buttonStyle = ButtonStyle.Primary;
    if (buttonStyleOption) {
      buttonStyle = (async () => {
        const buttonStyleOption = interaction.options.get(`button-style`);
        switch (buttonStyleOption) {
          case "primary":
            return ButtonStyle.Primary;
          case "secondary":
            return ButtonStyle.Secondary;
          case "success":
            return ButtonStyle.Success;
          case "danger":
            return ButtonStyle.Danger;
          case "link":
            return ButtonStyle.Link;
          default:
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`Thao tác thất bại !`)
                  .setDescription(`*Invalid Button style provided !*`)
                  .setColor(Colors.Red),
              ],
            });
            continue_ = false;
            return;
        }
      })();
    }
    if (!continue_) return;

    const button = new ButtonBuilder();
  },
};
