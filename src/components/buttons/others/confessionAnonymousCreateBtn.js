const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `anonymous_confession_create_btn`,
    label: `Anonymous Confession`,
    buttonStyle: ButtonStyle.Primary,
  },

  async execute(interaction, client) {
    await interaction.reply({
      content: `${this.data.label}`,
    });
  },
};
