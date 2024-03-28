const {
  TextChannel,
  CommandInteraction,
  ButtonInteraction,
  CategoryChannel,
  ChannelType,
  ModalSubmitInteraction,
  Guild,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
} = require("discord.js");
const logger = require("../../utils/logger");
const { NoichuChannelConfig, GuildConfig } = require("../../typings");
const { sendNotificationEmbedMessage, MessageWarnLevel, sendEmbedMsssage } = require("../../utils/message");
const { autoBuildButton } = require("../../utils/autoBuild");

class NoichuGuildManagerSystem {
  /**
   *
   * @param {Guild} guild
   */
  constructor(guild) {
    this.guild = guild;
    if (!guild) throw new Error(`CREATE_VARIABLE_ERROR: No guild was given !`);
    // if (!channel instanceof TextChannel) throw new Error(`CREATE_VARIABLE_ERROR: Wrong channel type !`);
  }

  /**
   * Create new channel
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {CategoryChannel} category
   */
  async createNewChannel(interaction, category) {
    try {
      const channel = await interaction.guild.channels.create({
        name: `Nối-chữ`,
        type: ChannelType.GuildText,
        parent: category ? category : null,
      });

      if (!(await this.createConfig())) {
        await channel.delete();
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Lỗi không xác định !`,
          MessageWarnLevel.ERROR,
          true
        );
        return false;
      }

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Đã set kênh: <#${channel.id}>`,
        MessageWarnLevel.SUCCESS,
        true
      );

      await sendEmbedMsssage(
        undefined,
        channel,
        `Bắt đầu game nối chữ !`,
        `Hãy bắt đầu game bằng một từ !`,
        undefined,
        Colors.Blurple,
        false,
        true
      );

      return true;
    } catch (error) {
      logger.errors.guild(`CREATE_NOICHU_CHANNEL_ERROR: guild>>${this.guild.id}: ${error}`);
      return false;
    }
  }

  /**
   * Set on exist channel
   * @param {CommandInteraction | ButtonInteraction | ModalSubmitInteraction} interaction
   * @param {TextChannel} channel
   */
  async setChannel(interaction, channel) {
    try {
      const config = new NoichuChannelConfig(channel.id, interaction.guildId);

      // Kiểm tra trùng kênh
      if (await config.sync()) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Kênh đã được set, vui lòng chọn kênh khác !`,
          MessageWarnLevel.WARNING,
          true
        );

        await interaction.editReply({ embeds: [embed] });
        return false;
      }

      // Kiểm tra số lượng kênh
      const guildConfig = new GuildConfig(interaction.guildId);
      const maxDefault = 1;
      if (
        !(await guildConfig.sync()) ||
        guildConfig.limOfNoichuChannel >= guildConfig.getNumberOfNoichuChannelInGuild()
      ) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Không thể set thêm kênh ! (Đã đạt giới hạn !)`,
          MessageWarnLevel.WARNING,
          true
        );
        return false;
      }

      const status = await config.update();

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Đã set kênh: <#${channel.id}>`,
        MessageWarnLevel.SUCCESS,
        true
      );

      await sendEmbedMsssage(
        undefined,
        channel,
        `Bắt đầu game nối chữ !`,
        `Hãy bắt đầu game bằng một từ !`,
        undefined,
        Colors.Blurple,
        false,
        true
      );

      return true;
    } catch (error) {
      logger.errors.guild(
        `SET_NOICHU_CHANNEL_ERROR: guild>>${this.guild.id} channel>>${channel.id}: ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction | ModalSubmitInteraction} interaction
   * @param {TextChannel} channel
   * @returns {Promise<Boolean>}
   */
  async unsetChannel(interaction, channel) {
    try {
      const config = new NoichuChannelConfig(channel.id, this.guild.id);

      if (!(await config.sync())) {
        interaction.deferred ? await interaction.deferReply({ fetchReply: true }) : "";

        const embed = new EmbedBuilder()
          .setTitle(`Thao tác thất bại !`)
          .setColor(Colors.Red)
          .setDescription(`*Config doesn't exist !*`)
          .setTimestamp(new Date().getTime());

        const message = await interaction.editReply({ embeds: [embed] });
        setTimeout(async () => (message.deletable ? await message.delete() : ""), 5000);
      }

      await config.delete();

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Đã xóa config <#${channel.id}>`,
        MessageWarnLevel.SUCCESS,
        true
      );

      return true;
    } catch (error) {
      logger.errors.guild(
        `UNSET_NOICHU_CHANNEL_ERROR: guild>>${this.guild.id} channel>>${this.channel.id}: ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async createConfig() {
    try {
      const config = new NoichuChannelConfig(this.channel.id, this.channel.guildId);
      if (await config.sync()) return false;
      else return await config.update();
    } catch (error) {
      logger.errors.guild(
        `CREATE_NOICHU_CONFIG_ERROR: guild>>${this.channel.guildId} channel>>${this.channel.id}: ${error}`
      );
      return false;
    }
  }
}

class NoichuChannelManager {
  /**
   *
   * @param {Guild} guild
   * @param {TextChannel} channel
   */
  constructor(guild, channel) {
    this.guild = guild;
    this.channel = channel;
    this.channelConfig = new NoichuChannelConfig(this.channel.id, this.guild.id);
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async checkConfigIsAvailable(interaction) {
    if (!(await this.channelConfig.sync())) {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Không phải kênh Nối chữ !`,
        MessageWarnLevel.WARNING,
        false
      );
      return false;
    }
    return true;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {String} messageContent
   * @returns {Promise<Boolean>}
   */
  async checkStatusAndResponse(interaction, messageContent) {
    if (!(await this.channelConfig.update())) {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Lỗi không xác định !`,
        MessageWarnLevel.ERROR,
        false
      );
      return false;
    }

    await sendNotificationEmbedMessage(
      interaction,
      undefined,
      messageContent,
      MessageWarnLevel.SUCCESS,
      false
    );
    return true;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {TextChannel} channel
   */
  async reset(interaction) {
    if (!(await this.checkConfigIsAvailable(interaction))) return;

    this.channelConfig.lastWord = "";
    this.channelConfig.lastUserId = "";
    this.channelConfig.wordUsedList = "";

    if (await this.checkStatusAndResponse(interaction, "Đã reset !")) {
      await sendEmbedMsssage(
        undefined,
        this.channel,
        "Bắt đầu game nối chữ.",
        "Hãy bắt đầu bằng từ !",
        null,
        Colors.Blurple,
        false,
        false
      );
      return true;
    }

    return false;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction | ModalSubmitInteraction} interaction
   * @param {Number} amout
   * @returns {Promise<Boolean>}
   */
  async setLimit(interaction, amout) {
    if (!(await this.checkConfigIsAvailable(interaction))) return;

    const oldConfig = this.channelConfig;
    this.channelConfig.limit = amout;

    return await this.checkStatusAndResponse(
      interaction,
      `Giới hạn đã đổi: ${oldConfig.limit} => ${this.channelConfig.limit}`
    );
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async setRepeated(interaction) {
    if (!(await this.checkConfigIsAvailable(interaction))) return;

    this.channelConfig.repeated === 1
      ? (this.channelConfig.repeated = -1)
      : (this.channelConfig.repeated = 1);

    return await this.checkStatusAndResponse(
      interaction,
      `Đã set luật chơi \`repeated\`: ${this.channelConfig.repeated === 1 ? "✅" : "❌"}`
    );
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async sendSettingEditInterface(interaction) {
    const client = interaction.client;

    if (!(await this.checkConfigIsAvailable(interaction))) {
      const embed = new EmbedBuilder()
        .setTitle(`Bạn có muốn set kênh <#${channelConfig.id}> để chơi nối chữ không ?`)
        .setColor(Colors.Yellow);

      const setButton = autoBuildButton(client.buttons.get(`noichu-set-btn`).data);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([setButton, closeButton]);

      interaction.deferred
        ? await interaction.editReply({ embeds: [embed], components: [actionRow] })
        : await interaction.channel.send({ embeds: [embed], components: [actionRow] });
    } else {
      const removeButton = autoBuildButton(client.buttons.get(`noichu-remove-channel-btn`).data);
      const setMaxWordsButton = autoBuildButton(client.buttons.get(`noichu-set-max-words`).data);
      const setRepeat = autoBuildButton(client.buttons.get(`noichu-set-repeat`).data);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([
        removeButton,
        setMaxWordsButton,
        setRepeat,
        closeButton,
      ]);

      interaction.deferred
        ? await interaction.editReply({
            embeds: [await this.channelConfig.createConfigEmbed()],
            components: [actionRow],
          })
        : await interaction.channel.send({
            embeds: [await this.channelConfig.createConfigEmbed()],
            components: [actionRow],
          });
    }
  }
}

module.exports = { NoichuGuildManagerSystem, NoichuChannelManager };
