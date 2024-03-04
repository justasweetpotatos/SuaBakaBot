const { SlashCommandSubcommandBuilder, SlashCommandStringOption, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`reload-command`)
    .setDescription(`Reload slash command !`)
    .addStringOption(
      new SlashCommandStringOption()
        .setDescription(`Name of command`)
        .setName(`command-name`)
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const inputCommandNameValue = interaction.options.getString(`command-name`).trimRight();

      if (!inputCommandNameValue) {
        await interaction.editReply({ content: "Invalid command name provided!" });
        return;
      }

      const [normalCommandName, subcommandName] = inputCommandNameValue.split(" ");
      const normalCommand = client.commands.get(normalCommandName);

      if (!normalCommand) {
        await interaction.editReply({ content: `Command "${inputCommandNameValue}" does not exist!` });
        return;
      }

      if (subcommandName) {
        const subcommand = normalCommand.data.options.find((option) => option.name === subcommandName);

        if (!subcommand) {
          await interaction.editReply({
            content: `Subcommand "${subcommandName}" of command "${normalCommandName}" does not exist!`,
          });
          return;
        }

        await interaction.editReply({ content: `Reloading subcommand: "${inputCommandNameValue}"` });
      } else await interaction.editReply({ content: `Reloading command: "${inputCommandNameValue}"` });

      if (subcommandName) {
        const commandPath = client.commandPaths.get(inputCommandNameValue);
        if (require.cache[require.resolve(commandPath)]) delete require.cache[require.resolve(commandPath)];
        const command = require(commandPath);

        client.subcommands.set(subcommandName, command);
      } else {
        const commandPath = client.commandPaths.get(inputCommandNameValue);
        if (require.cache[require.resolve(commandPath)]) delete require.cache[require.resolve(commandPath)];
        const command = require(commandPath);

        client.commands.set(normalCommandName, command);
      }

      await interaction.editReply({ content: `Reloaded command successfully: "${inputCommandNameValue}"` });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: `Error reloading command "${inputCommandNameValue}": ${err.message}` });
    }
  },
};
