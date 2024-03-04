const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `confession_report_btn`,
    label: `Report`,
    buttonStyle: ButtonStyle.Danger,
  },

  async execute(interaction, client) {
    await interaction.reply({
      content: `${this.data.label}`,
    });
  },
};
