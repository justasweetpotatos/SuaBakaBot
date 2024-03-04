const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `cancel-btn`,
    label: `Cancel`,
    buttonStyle: ButtonStyle.Danger,
  },

  async execute(interaction, client, execute) {
    await interaction.reply({
      content: `${this.data.label}`,
    });
  },
};
