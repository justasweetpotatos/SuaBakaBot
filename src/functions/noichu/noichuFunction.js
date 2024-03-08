const { EmbedBuilder, Colors, ActionRowBuilder, Client, Guild } = require("discord.js");
const { NoichuChannelConfig, GuildConfig } = require(`../../typings/index`);
const { autoBuildButton } = require("../../utils/autoBuild");

class NoichuGuildManager {
  /**
   *
   * @param {String} guildId
   */
  constructor(guildId, channelId) {
    this.guildId = guildId;
    this.channelId = channelId;
  }

  /**
   * Set channel thành kênh chơi nối chữ
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   * @returns
   */
  async setChannel(interaction, channelId) {
    const beforeInteractionMessage = interaction.message;
    const deferedReply = await interaction.deferReply({ fetchReply: true });

    // Nếu không có đầu vào set channel là interaction channel
    let channel = channelId ? await interaction.guild.channels.fetch(channelId) : interaction.channel;

    // kiểm tra xem channel đã tồn tại trên database chưa, nếu rồi trả về tin nhắn cho người dùng
    const channelConfig = new NoichuChannelConfig(channel.id, interaction.guildId);
    if (await channelConfig.sync()) {
      const embed = new EmbedBuilder()
        .setTitle(`Bạn đã set kênh này rồi, vui lòng chọn kênh khác !`)
        .setColor(Colors.Yellow);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
      return;
    }

    // nếu đã đạt max giới hạn có thể tạo, trả về tin nhắn cho người dùng
    const guildConfig = new GuildConfig(interaction.guildId);
    if (!(await guildConfig.sync())) {
      if (!(await guildConfig.update())) throw new Error(`Error on registing guild with id ${interaction.guild.id}`);
    } else {
      const count = await guildConfig.getNumberOfNoichuChannelInGuild();
      if (count >= guildConfig.limOfNoichuChannel) {
        const embed = new EmbedBuilder()
          .setTitle(`Đã đạt giới hạn set kênh nối chữ !`)
          .setColor(Colors.Yellow)
          .setDescription(`*Giới hạn có thể tạo trong guild của bạn là **${guildConfig.limOfNoichuChannel}***`);
        await interaction.editReply({ embeds: [embed] });
        setTimeout(async () => {
          await deferedReply.delete();
        }, 5000);
        return;
      }
    }

    // Đẩy dữ liệu về database
    const status = await channelConfig.update();

    // Gửi thông báo thành công về cho người dùng
    if (status) {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thành công !`)
        .setColor(Colors.Green)
        .setDescription(`**Đã set kênh nối chữ: <#${channel.id}>**`);
      const embed2 = new EmbedBuilder()
        .setTitle(`Bắt đầu game nối chữ !`)
        .setDescription(`Hãy bắt đầu game bằng một từ !`)
        .setColor(Colors.Green);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
      await channel.send({ embeds: [embed2] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại !`)
        .setColor(Colors.Yellow)
        .setDescription(`Lỗi thực thi lệnh !`);

      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
    }

    if (beforeInteractionMessage) await beforeInteractionMessage.delete();
  }

  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   */
  async removeChannel(interaction, channelId) {
    const deferedReply = await interaction.deferReply({ fetchReply: true });
    const channelConfig = new NoichuChannelConfig(channelId, interaction.guildId);
    if (await channelConfig.sync()) {
      await channelConfig.delete();
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thành công !`)
        .setColor(Colors.Green)
        .setDescription(`Đã xóa config của game nối chữ khỏi channel <#${channelConfig.id}>`);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại !`)
        .setColor(Colors.Yellow)
        .setDescription(`*Game nối chữ không được set ở channel này !*`);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
    }
  }

  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   * @param {Number} amount
   */
  async setMaxWords(interaction, channelId, amount) {
    const deferedReply = await interaction.deferReply({ fetchReply: true });
    const channelConfig = new NoichuChannelConfig(channelId, interaction.guildId);
    if (!(await channelConfig.sync())) {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại!`)
        .setColor(Colors.Yellow)
        .setDescription(`*Game nối chữ không được set ở channel này !*`);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
      return;
    }

    const oldLimmit = channelConfig.limit;
    channelConfig.limit = amount;
    await channelConfig.update();

    const embed = new EmbedBuilder()
      .setTitle(`Thao tác thành công !`)
      .setColor(Colors.Green)
      .setDescription(`*Đã đặt giới hạn từ:*\n*\`${oldLimmit}\` to \`${channelConfig.limit}\`*`);
    await interaction.editReply({ embeds: [embed] });
    setTimeout(async () => {
      await deferedReply.delete();
    }, 5000);
  }

  /**
   * Reset game nối chữ !
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   */
  async reset(interaction, channelId) {
    const deferedReply = await interaction.deferReply({ fetchReply: true });
    const channelConfig = new NoichuChannelConfig(channelId, interaction.guildId);
    if (!(await channelConfig.sync())) {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại !`)
        .setColor(Colors.Yellow)
        .setDescription(`*Game nối chữ không được set ở channel này !*`);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        await deferedReply.delete();
      }, 5000);
    } else {
      channelConfig.lastWord = "";
      channelConfig.lastUserId = "";
      channelConfig.wordUsedList = "";

      if (await channelConfig.update()) {
        const embed = new EmbedBuilder()
          .setTitle(`Thao tác thành công !`)
          .setColor(Colors.Green)
          .setDescription(`*Đã reset game nối chữ <#${channelId}>*`);
        const embed2 = new EmbedBuilder()
          .setTitle(`Bắt đầu game nối chữ !`)
          .setDescription(`Hãy bắt đầu game bằng một từ !`)
          .setColor(Colors.Green);
        await interaction.editReply({ embeds: [embed] });
        setTimeout(async () => {
          await deferedReply.delete();
        }, 5000);
        await interaction.channel.send({ embeds: [embed2] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle(`Thao tác thất bại !`)
          .setColor(Colors.Yellow)
          .setDescription(`*Lỗi thực thi lệnh !*`);
        await interaction.editReply({ embeds: [embed] });
        setTimeout(async () => {
          await deferedReply.delete();
        }, 5000);
      }
    }
  }

  /**
   * Set repeated cho channel !
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   */
  async setRepeated(interaction, channelId) {
    if (!interaction.deferred) await interaction.deferReply({ fetchReply: true });

    const channelConfig = new NoichuChannelConfig(channelId, interaction.guildId);

    if (!(await channelConfig.sync())) {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại !`)
        .setColor(Colors.Yellow)
        .setDescription(`*Game nối chữ không được set ở channel này !*`);
      if (interaction.deferred) await interaction.reply({ embeds: { embed } });
      else await interaction.editReply({ embeds: [embed] });
      return;
    }

    channelConfig.repeated === 1 ? (channelConfig.repeated = -1) : (channelConfig.repeated = 1);

    if (!(await channelConfig.update()))
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thất bại !`)
            .setDescription(`*lỗi thực thi lệnh !*`)
            .setColor(Colors.Red),
        ],
      });
    else
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thành công !`)
            .setColor(Colors.Green)
            .setDescription(`*Đã set luật chơi \`repeated\`: ${channelConfig.repeated === 1 ? "✅" : "❌"}*`),
        ],
      });

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  }

  /**
   * Trả về config cho người dùng !
   * @param {import("discord.js").Interaction} interaction
   * @param {String} channelId
   * @param {Client} client
   */
  async configChannel(interaction, channelId, client) {
    !channelId ? (channelId = interaction.channelId) : "";
    !interaction.deferred ? await interaction.deferReply({ fetchReply: true }) : "";

    const channelConfig = new NoichuChannelConfig(channelId, interaction.guildId);

    if (!(await channelConfig.sync())) {
      const embed = new EmbedBuilder()
        .setTitle(`Bạn có muốn set kênh <#${channelConfig.id}> để chơi nối chữ không ?`)
        .setColor(Colors.Yellow);

      const setButton = autoBuildButton(client.buttons.get(`noichu-set-btn`).data);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([setButton, closeButton]);

      await interaction.editReply({ embeds: [embed], components: [actionRow] });
    } else {
      const removeButton = autoBuildButton(client.buttons.get(`noichu-remove-channel-btn`).data);
      const setMaxWordsButton = autoBuildButton(client.buttons.get(`noichu-set-max-words`).data);
      const setRepeat = autoBuildButton(client.buttons.get(`noichu-set-repeat`).data);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([removeButton, setMaxWordsButton, setRepeat, closeButton]);

      await interaction.editReply({ embeds: [channelConfig.createConfigEmbed()], components: [actionRow] });
    }
  }

  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {String} guildId
   * @param {Client} client
   * @param {number} numberOfNoichuChannel
   * @returns {Promise<Boolean | undefined>}
   */
  async checkMaxChannel(interaction, guildId, client) {
    const config = new GuildConfig(guildId, "", 1);

    if (!(await config.sync())) await config.update();
  }
}

module.exports = { NoichuGuildManager };
