const { Client, SlashCommandStringOption, EmbedBuilder, Colors, SlashCommandSubcommandBuilder } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const { registCommands } = require("../../registry/commandRegister");
const commandRegister = require("../../registry/commandRegister");

/**
 *
 * @param {import('discord.js').Interaction} interaction
 * @param {Client} client
 */
async function unloadCommand(interaction, client) {
  let isExitsCommand = true;
  let command = interaction.commandName;
  let isSubcommand = interaction.options.getSubcommand();
}

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`unload-command`)
    .setDescription(`Unload a command !`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`command-name`)
        .setDescription(`Name of command`)
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const inputCommandNameValue = interaction.options.get(`command-name`)?.value;

    try {
      let normalCommandName = inputCommandNameValue.split(" ")[0];
      let subcommandName = inputCommandNameValue.split(" ")[1];

      let normalCommand = client.commands.get(normalCommandName);

      // Nếu command không hợp lệ gửi thông báo đến người dùng
      if (!normalCommand) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Lệnh với tên \`${inputCommandNameValue}\` không tồn tại!`)
              .setColor(Colors.Yellow),
          ],
        });
        return;
      } else if (subcommandName) {
        let subcommand;
        normalCommand.data.options.forEach((command) =>
          command.name === subcommandName ? (subcommand = command) : ""
        );
        subcommand = client.subcommands.get(subcommand.name);
        if (!subcommand) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Lệnh với tên \`${inputCommandNameValue}\` không tồn tại!`)
                .setColor(Colors.Yellow),
            ],
          });
          return;
        }

        client.unloadedSubcommands.set(subcommand.data.name, subcommand);
        client.subcommandJSONArray = client.subcommandJSONArray.filter((item) => item.name !== subcommandName);
        client.commandNameList = client.commandNameList.filter((item) => item.name !== inputCommandNameValue);

        client.commandJSONArray.forEach(
          (command) => (command.options = command.options.filter((item) => item.name !== subcommandName))
        );

        await interaction.editReply({ content: `Unloading command: \`${inputCommandNameValue}\`` });
        await registCommands(client);
      } else {
        client.unloadedCommands.set(normalCommand.data.name, normalCommand);
        client.commandJSONArray = client.commandJSONArray.filter((item) => item.name !== normalCommandName);
        client.commandNameList = client.commandNameList.filter((item) => item.name !== inputCommandNameValue);
        await registCommands(client);
      }

      await interaction.editReply({ content: `Unload command successfully: \`${inputCommandNameValue}\`` });
    } catch (err) {
      console.log(err);
      await interaction.editReply({ content: `error ! ${err}` });
    }
  },
};
