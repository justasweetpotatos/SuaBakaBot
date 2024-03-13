const {
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require("discord.js");

module.exports = {
  autoBuildButton(data) {
    const button = new ButtonBuilder().setCustomId(data.customId).setLabel(data.label).setStyle(data.buttonStyle);

    // Kiểm tra và đặt emoji nếu có
    if (data.emoji && typeof data.emoji === "string") {
      button.setEmoji(data.emoji);
    }

    // Kiểm tra và đặt trạng thái disabled nếu có
    if (typeof data.disabled === "boolean") {
      button.setDisabled(data.disabled);
    }

    // Kiểm tra và đặt URL nếu có
    if (data.url && typeof data.url === "string") {
      button.setURL(data.url);
    }

    return button;
  },
  autoBuildStringMenu(data) {
    const options = data.options.map((item) =>
      new StringSelectMenuOptionBuilder().setLabel(item.label).setDescription(item.description).setValue(item.value)
    );
    const menu = new StringSelectMenuBuilder()
      .setCustomId(data.customId)
      .setPlaceholder(data.placeholder)
      .addOptions(options);

    data.minValues ? menu.setMinValues(data.minValue) : "";
    data.maxValues ? menu.setMinValues(data.maxValues) : "";

    return menu;
  },
  /**
   *
   * @param {any} data
   * @param {import("discord.js").Interaction} interaction
   * @returns
   */
  autoBuildChannelMenu(data, interaction) {
    const menu = new ChannelSelectMenuBuilder()
      .setCustomId(data.customId)
      .setPlaceholder(data.placeholder)
      .setChannelTypes(ChannelType.GuildText);

    data.minValues ? menu.setMinValues(data.minValue) : "";
    data.maxValues ? menu.setMinValues(data.maxValues) : menu.setMinValues(1);
    return menu;
  },
};
