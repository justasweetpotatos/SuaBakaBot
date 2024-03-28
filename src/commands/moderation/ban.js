const {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  CommandInteraction,
  Client,
} = require("discord.js");
const { GuildConfig } = require("../../typings");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`ban`)
    .addUserOption(
      new SlashCommandUserOption().setName(`user`).setDescription(`User to ban.`).setRequired(true)
    )
    .addNumberOption(
      new SlashCommandNumberOption().setName(`time`).setDescription(`Time by minute.`).setMaxValue(43200)
    )
    .addStringOption(new SlashCommandStringOption().setName(`reason`).setDescription(`Ban reason.`)),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.get(`user`).member;
    const time = interaction.options.get(`time`) ? interaction.options.get(`time`).value : 15;
    const reason = interaction.options.get(`reason`) ? interaction.options.get(`reason`).value : `No reason`;

    const guildConfig = new GuildConfig(interaction.guildId, interaction.guild.name, 1);
    if (!(await guildConfig.sync())) await guildConfig.update();

    const roles = guildConfig.botManagerRoles;
  },
};
