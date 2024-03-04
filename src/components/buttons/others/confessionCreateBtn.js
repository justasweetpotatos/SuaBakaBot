const { ButtonStyle } = require("discord.js");
module.exports = {
  data: {
    customId: `confession_create_btn`,
    label: `Confession`,
    buttonStyle: ButtonStyle.Success,
  },

  async execute(interaction, client) {
    await interaction.reply({
      content: `${this.data.label}`,
    });
  },
};
