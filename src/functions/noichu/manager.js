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
  TextBasedChannel,
} = require("discord.js");
const logger = require("../../utils/logger");
const { NoichuChannelConfig, GuildConfig } = require("../../typings");
const { sendNotificationEmbedMessage, MessageWarnLevel, sendEmbedMsssage } = require("../../utils/message");
const { autoBuildButton, autoBuildChannelMenu } = require("../../utils/autoBuild");
const { NoichuChannelConfigRepository, GuildConfigRepository } = require("../../database/repository");

class NoichuGuildManager {
  /**
   *
   * @param {Guild} guild
   */
  constructor(guild) {
    this.guild = guild;
    if (!guild) throw new Error(`CREATE_VARIABLE_ERROR: No guild was given !`);
    this.guildRepository = new GuildConfigRepository();
    this.channelRepository = new NoichuChannelConfigRepository();
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

      if (!(await this.createConfig(channel))) {
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
      if (await this.channelRepository.sync(config)) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Kênh đã được set, vui lòng chọn kênh khác !`,
          MessageWarnLevel.WARNING,
          true
        );
        return false;
      }

      // Kiểm tra số lượng kênh
      const guildConfig = new GuildConfig(interaction.guildId);
      if (
        !(await this.guildRepository.sync(guildConfig)) ||
        guildConfig.limOfNoichuChannel >=
          (await this.guildRepository.getNumberOfNoichuChannelInGuild(guildConfig))
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

      const status = await this.channelRepository.update(config);

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
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async sendMenuSelector(interaction) {
    const client = interaction.client;
    const selectChannelMenu = autoBuildChannelMenu(client.selectMenus.get(`noichu-channel-selector`).data);

    const actionRow1 = new ActionRowBuilder().addComponents(selectChannelMenu);
    const actionRow2 = new ActionRowBuilder();
    const embed = new EmbedBuilder()
      .setTitle(`Cài đặt game nối chữ !`)
      .setDescription(`*Chọn một kênh để bắt đầu !*`)
      .setColor(Colors.Blurple);
    const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
    actionRow2.addComponents([closeButton]);

    await interaction.editReply({ embeds: [embed], components: [actionRow1, actionRow2] });
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

      if (!(await this.channelRepository.sync(config))) {
        interaction.deferred ? "" : await interaction.deferReply({ fetchReply: true });

        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `*Config doesn't exist !*`,
          MessageWarnLevel.WARNING,
          true
        );

        return false;
      }

      await this.channelRepository.delete(config);

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
        `UNSET_NOICHU_CHANNEL_ERROR: guild>>${this.guild.id} channel>>${channel.id}: ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @param {TextBasedChannel} channel
   * @returns {Promise<Boolean>}
   */
  async createConfig(channel) {
    try {
      const config = new NoichuChannelConfig(channel.id, this.guild.id);
      return await this.channelRepository.update(config);
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
    this.channelRepository = new NoichuChannelConfigRepository();
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {Boolean} sendNotification
   */
  async checkConfigIsAvailable(interaction, sendNotification) {
    if (!(await this.channelRepository.sync(this.channelConfig))) {
      sendNotification
        ? await sendNotificationEmbedMessage(
            interaction,
            undefined,
            `Không phải kênh Nối chữ !`,
            MessageWarnLevel.WARNING,
            false
          )
        : "";
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
    if (!(await this.channelRepository.update(this.channelConfig))) {
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
   * @returns {Promise<Boolean>}
   */
  async reset(interaction) {
    if (!(await this.checkConfigIsAvailable(interaction, true))) return false;

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
    if (!(await this.checkConfigIsAvailable(interaction, true))) return;

    const oldLimit = this.channelConfig.limit;
    this.channelConfig.limit = amout;

    return await this.checkStatusAndResponse(interaction, `Giới hạn đã đổi: ${oldLimit} => ${amout}`);
  }

  /**
   *
   * @param {ButtonInteraction} interaction
   * @returns {Promise<Boolean>}
   */
  async setRepeated(interaction) {
    if (!(await this.checkConfigIsAvailable(interaction, true))) return false;

    const configMessage = interaction.message;

    this.channelConfig.repeated === 1
      ? (this.channelConfig.repeated = -1)
      : (this.channelConfig.repeated = 1);

    const status = await this.checkStatusAndResponse(
      interaction,
      `Đã set luật chơi \`repeated\`: ${this.channelConfig.repeated === 1 ? "✅" : "❌"}`
    );

    await configMessage.edit({ embeds: [this.channelConfig.createConfigEmbed()] });

    return status;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async sendSettingEditInterface(interaction) {
    interaction.deferred ? "" : await interaction.deferReply({ fetchReply: true });
    const client = interaction.client;

    if (!(await this.checkConfigIsAvailable(interaction, false))) {
      const embed = new EmbedBuilder()
        .setTitle(`Bạn có muốn set kênh <#${this.channelConfig.id}> để chơi nối chữ không ?`)
        .setColor(Colors.Yellow);

      const setButton = autoBuildButton(client.buttons.get(`noichu-set-btn`).data);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([setButton, closeButton]);

      interaction.deferred ? "" : await interaction.deferReply({ ephemeral: false });
      await interaction.editReply({ embeds: [embed], components: [actionRow] });
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

      await interaction.editReply({
        embeds: [await this.channelConfig.createConfigEmbed()],
        components: [actionRow],
      });
    }
  }
}

module.exports = { NoichuGuildManager, NoichuChannelManager };
