const {
  ActionRowBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { autoBuildStringMenu, autoBuildBtn } = require("../../utils/autoBuild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-menu")
    .setDescription("Create a menu")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const stringMenuData = client.selectMenus.get(`menu-test`).data;
    const buttonData = client.buttons.get(`delete-message-btn`).data;

    const menu = autoBuildStringMenu(stringMenuData);
    const deleteMessageBtn = autoBuildBtn(buttonData);

    const actionRow = new ActionRowBuilder().addComponents(menu);
    const actionRow2 = new ActionRowBuilder().addComponents(deleteMessageBtn);

    await interaction.reply({
      components: [actionRow, actionRow2],
    });
  },
};
