const {
  ButtonBuilder,
  ActionRowBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { execute } = require("../../events/client/ready");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-button")
    .setDescription("Create a button")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const buttonData = client.buttons.get("delete-message-btn");

    const button = new ButtonBuilder()
      .setCustomId(buttonData.data.customId)
      .setLabel(buttonData.data.label)
      .setStyle(buttonData.data.buttonStyle);
    await interaction.reply({
      components: [new ActionRowBuilder().addComponents([button])],
    });
  },
};
