const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
  SlashCommandRoleOption,
} = require("discord.js");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`add`)
    .setDescription(`Add reaction emoji to messsage`)
    .addStringOption(
      new SlashCommandStringOption().setName(`message-id`).setDescription(`Id of message to add button.`)
    )
    .addRoleOption(
      new SlashCommandRoleOption().setName(`role`).setDescription(`Role to add on pressing button !`).setRequired(true)
    )
    .addStringOption(new SlashCommandStringOption().setName(`emoji`).setDescription(`Button Emoji`))
    .addStringOption(
      new SlashCommandStringOption().setName(`button-style`).setDescription(`Style of button.`).setAutocomplete(true)
    ),
  /**
   *
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const messageId = interaction.options.get(`id`);
    const role = interaction.options.get(`role`);
    const emojiRawString = interaction.options.get(`emoji`);
    const buttonStyleOption = interaction.options.get(`button-style`);
  },
};