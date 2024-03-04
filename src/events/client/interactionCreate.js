const logger = require("../../utils/logger");
const { Permissions, EmbedBuilder, Embed, Colors } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {*} client
   * @returns
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        if (command.data.name === "command" && interaction.user.id !== "866628870123552798") {
          await interaction.reply({
            embeds: [new EmbedBuilder().setTitle(`Bạn không phải người điểu hành bot !`).setColor(Colors.Red)],
            ephemeral: true,
          });
          return;
        }
        try {
          const subcommand = client.subcommands.get(interaction.options.getSubcommand());
          await subcommand.execute(interaction, client);
        } catch {
          await command.execute(interaction, client);
        }
      } catch (error) {
        console.error(error);
        if (interaction.deferred) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setTitle(`Lỗi rồi ;-;, hãy báo lại với admin của bot nha !`).setColor(`#fc3728`),
            ],
          });
          return;
        }
        await interaction.reply({
          embeds: [new EmbedBuilder().setTitle(`Lỗi rồi ;-;, hãy báo lại với admin của bot nha !`).setColor(`#fc3728`)],
        });
      }
    } else if (interaction.isButton()) {
      const { customId } = interaction;
      const button = client.buttons.get(customId);

      if (!button) {
        logger.error(`No action found for button with customId: ${customId}`);
        return;
      }

      try {
        await button.execute(interaction, client);
      } catch (error) {
        logger.error(`Error executing button handler: ${error.message}`);
      }
    } else if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu()) {
      const { customId } = interaction;
      const menu = client.selectMenus.get(customId);

      if (!menu) {
        logger.error(`No action found for this select on this menu.`);
        return;
      }

      try {
        menu.execute(interaction, client);
      } catch (err) {
        logger.error(err);
      }
    } else if (interaction.isAutocomplete()) {
      let choices = [];
      let filteredChoices;
      let focusedValue = interaction.options.getFocused(true);
      switch (interaction.commandName) {
        case "purge":
          switch (interaction.options.getSubcommand()) {
            case "bot":
              switch (focusedValue.name) {
                case "amount":
                  let commitValue;
                  if (!focusedValue.value) commitValue = 1;
                  else commitValue = focusedValue.value;
                  choices = [
                    { name: (commitValue * 1).toString(), value: commitValue * 1 },
                    { name: (commitValue * 10).toString(), value: commitValue * 10 },
                    { name: (commitValue * 100).toString(), value: commitValue * 100 },
                    { name: (commitValue * 1000).toString(), value: commitValue * 1000 },
                    { name: (commitValue * 10000).toString(), value: commitValue * 10000 },
                  ];
                  filteredChoices = choices.filter((choice) => choice.name.startsWith(focusedValue.value));
                  interaction.respond(filteredChoices.slice(0, 25)).catch(() => {});
                  break;
              }
              break;
            case "by":
              switch (focusedValue.name) {
                case "amount":
                  let commitValue;
                  if (!focusedValue.value) commitValue = 1;
                  else commitValue = focusedValue.value;
                  choices = [
                    { name: (commitValue * 1).toString(), value: commitValue * 1 },
                    { name: (commitValue * 10).toString(), value: commitValue * 10 },
                    { name: (commitValue * 100).toString(), value: commitValue * 100 },
                    { name: (commitValue * 1000).toString(), value: commitValue * 1000 },
                    { name: (commitValue * 10000).toString(), value: commitValue * 10000 },
                  ];
                  filteredChoices = choices.filter((choice) => choice.name.startsWith(focusedValue.value));
                  interaction.respond(filteredChoices.slice(0, 25)).catch(() => {});
                  break;
              }
              break;
          }
          break;
        case "command":
          switch (interaction.options.getSubcommand()) {
            case `unload-command`:
              switch (focusedValue.name) {
                case "command-name":
                  choices = client.commandNameList;
                  filteredChoices = choices.filter((choice) => choice.name.startsWith(focusedValue.value));
                  interaction.respond(filteredChoices.slice(0, 25)).catch(() => {});
                  break;
              }
              break;
            case `reload-command`:
              switch (focusedValue.name) {
                case "command-name":
                  choices = client.commandNameList;
                  filteredChoices = choices.filter((choice) => choice.name.startsWith(focusedValue.value));
                  interaction.respond(filteredChoices.slice(0, 25)).catch(() => {});
                  break;
              }
              break;
          }
          break;
      }
    }
  },
};
