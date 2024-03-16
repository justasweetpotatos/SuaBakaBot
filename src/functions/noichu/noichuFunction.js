const { EmbedBuilder, Colors, ActionRowBuilder, Client, Message } = require("discord.js");
const { NoichuChannelConfig, GuildConfig, NoituTiengVietChannelConfig } = require(`../../typings/index`);
const { autoBuildButton } = require("../../utils/autoBuild");
const logger = require("../../utils/logger");

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
      if (!(await guildConfig.update()))
        throw new Error(`Error on registing guild with id ${interaction.guild.id}`);
    } else {
      const count = await guildConfig.getNumberOfNoichuChannelInGuild();
      if (count >= guildConfig.limOfNoichuChannel) {
        const embed = new EmbedBuilder()
          .setTitle(`Đã đạt giới hạn set kênh nối chữ !`)
          .setColor(Colors.Yellow)
          .setDescription(
            `*Giới hạn có thể tạo trong guild của bạn là **${guildConfig.limOfNoichuChannel}***`
          );
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
      const actionRow = new ActionRowBuilder().addComponents([
        removeButton,
        setMaxWordsButton,
        setRepeat,
        closeButton,
      ]);

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

/**
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 * Return ramdom number from min to max
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class NoichuChecker {
  constructor(channelId, guildId) {
    this.channelId = channelId;
    this.guildId = guildId;
    if (!(channelId && guildId)) throw new Error(`NoichuChecker: channelId and guildId required !`);
    this.channelConfig = new NoichuChannelConfig(channelId, guildId);
    this.guildConfig = new GuildConfig(guildId, "", 1);
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async syncConfig() {
    try {
      if (!(await this.guildConfig.sync())) await this.guildConfig.update();
      if (!(await this.channelConfig.sync())) return false;
      return true;
    } catch (error) {
      logger.errors.server(`Error on syncing config for NoichuChecker with guild id ${this.guildId}`);
      return false;
    }
  }

  /**
   *
   * @param {Message} messageTarget
   * @param {String} content
   */
  async noiChuError(messageTarget, content) {
    const embed = new EmbedBuilder().setTitle(`${content}`).setColor(`#fff700`);
    await messageTarget.react("❌");
    let repliedMessage = await messageTarget.reply({
      embeds: [embed],
    });
    setTimeout(async () => {
      await repliedMessage.delete();
    }, 5000);
  }

  /**
   *
   * @param {String} word
   * @param {Message} message
   * @returns
   */
  async checkWord(word, message) {
    const dict = require("../../assets/noichuDictionary.json");

    if (!dict[word]) {
      const messages = this.channelConfig.wrongWordMessages;
      await this.noiChuError(message, messages.at(getRandomInt(0, 2)));
      return false;
    }

    return true;
  }

  /**
   * Kiểm tra xem người dùng đã nối từ trước đó hay chưa
   * @param {String} authorId
   * @param {String} word
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkLastUser(authorId, word, message) {
    const messages = this.channelConfig.isBeforeUserMessages;

    if (this.channelConfig.lastUserId) {
      if (this.channelConfig.lastUserId === authorId) {
        await this.noiChuError(message, messages.at(getRandomInt(0, 3)));
        return false;
      }
    } else return await checkWord(word, message);

    return true;
  }

  /**
   * Kiểm tra xem chữ của từ đang nối có trùng với chữ của từ cuối cùng hay không
   * @param {String} word
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkStartChar(word, message) {
    if (!this.channelConfig.lastWord) return await this.checkWord(word, message);

    const lastChar = this.channelConfig.lastWord.charAt(this.channelConfig.lastWord.length - 1);

    if (!word.startsWith(lastChar)) {
      await this.noiChuError(message, `Đần, mày phải bắt đầu bằng \`${lastChar}\` chứ :|| !`);
      return false;
    }
    return true;
  }

  /**
   * Kiểm tra có phải từ đã được dùng hay không.
   * @param {String} word
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkIsRepeated(word, message) {
    const messages = [`Có thằng nối từ này rồi, chọn khác đê !`];

    if (!this.channelConfig.wordUsedList) return true;

    const object = ((inputString) => {
      return inputString.split(" ").reduce((obj, item, index) => {
        obj[item] = item;
        return obj;
      }, {});
    })(this.channelConfig.wordUsedList);

    if (object[word]) {
      await this.noiChuError(message, messages[0]);
      return false;
    }
    return true;
  }

  /**
   * Check xem kênh đã đạt giới hạn nối chữ chưa
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkIsReachedMaxWords(message) {
    const length = this.channelConfig.wordUsedList.split(" ").length;
    if (this.channelConfig.limit < 1) return true;
    if (length >= this.channelConfig.limit) {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Game nối chữ đã đạt max từ: *\`${this.channelConfig.limit}\`*`)
            .setDescription(`*Reset game !*`),
        ],
      });

      this.channelConfig.lastWord = "";
      this.channelConfig.lastUserId = "";
      this.channelConfig.wordUsedList = "";
      return true;
    }
    return false;
  }

  /**
   *
   * @param {Message} message
   */
  async check(message) {
    try {
      const authorId = message.author.id;

      if (!(await this.syncConfig())) return false;

      const list = message.content.split(" ");
      if (list.length > 1) return;
      if (list[0].startsWith("<") || list[0].startsWith(":")) return;
      const word = list[0].toLowerCase();

      if (!(await this.checkLastUser(authorId, word, message))) return;
      if (!(await this.checkStartChar(word, message))) return;
      if (this.channelConfig.repeated === -1) {
        if (!(await this.checkIsRepeated(word, message))) return;
      }
      if (!(await this.checkWord(word, message))) return;

      message.react("✅");
      this.channelConfig.lastWord = word;
      this.channelConfig.lastUserId = authorId;
      this.channelConfig.wordUsedList = this.channelConfig.wordUsedList + " " + word;

      await this.checkIsReachedMaxWords(message);

      await this.channelConfig.update();
    } catch (error) {
      logger.errors.server(`Error on NoichuChecker: ${error}`);
    }
  }
}

class NoituChecker {
  /**
   *
   * @param {String} channelId
   * @param {String} guildId
   */
  constructor(channelId, guildId) {
    this.channelId = channelId;
    this.guildId = guildId;
    if (!(channelId && guildId)) throw new Error(`NoituChecker: channelId and guildId required !`);
    this.channelConfig = new NoituTiengVietChannelConfig(channelId, guildId);
    this.guildConfig = new GuildConfig(guildId, "", 1);
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async syncConfig() {
    try {
      if (!(await this.guildConfig.sync())) await this.guildConfig.update();
      if (!(await this.channelConfig.sync())) return false;
      return true;
    } catch (error) {
      logger.errors.server(`Error on syncing config for NoichuChecker with guild id ${this.guildId}`);
      return false;
    }
  }

  /**
   *
   * @param {Message} message
   * @param {String} content
   */
  async noiChuError(message, content) {
    const embed = new EmbedBuilder().setTitle(`${content}`).setColor(`#fff700`);
    await message.react("❌");
    let repliedMessage = await message.reply({
      embeds: [embed],
    });
    setTimeout(async () => {
      repliedMessage.deletable ? await repliedMessage.delete() : "";
    }, 5000);
  }

  /**
   *
   * @param {String} phrase
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkPhrase(phrase, message) {
    const dict = require(`../../assets/noituTiengVietDictionary.json`);

    if (!dict[phrase]) {
      const messages = this.channelConfig.wrongWordMessages;
      await this.noiChuError(message, messages.at(getRandomInt(0, 2)));
      return false;
    }

    return true;
  }

  /**
   * Kiểm tra xem người dùng đã nối từ trước đó hay chưa
   * @param {String} authorId
   * @param {String} phrase
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkLastUser(authorId, phrase, message) {
    const messages = this.channelConfig.isBeforeUserMessages;

    if (this.channelConfig.lastUserId) {
      if (this.channelConfig.lastUserId === authorId) {
        await this.noiChuError(message, messages.at(getRandomInt(0, 3)));
        return false;
      }
    } else return await this.checkPhrase(phrase, message);

    return true;
  }

  /**
   * Kiểm tra xem chữ của từ đang nối có trùng với chữ của từ cuối cùng hay không
   * @param {String} phrase
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkStartPhrase(phrase, message) {
    if (!this.channelConfig.lastWord) return await this.checkPhrase(phrase, message);

    const lastWord = this.channelConfig.lastWord.split(" ").reverse()[0];

    if (!(phrase.split(" ")[0] === lastWord)) {
      await this.noiChuError(message, `Đần, mày phải bắt đầu bằng \`${lastWord}\` chứ :|| !`);
      return false;
    }
    return true;
  }

  /**
   * Kiểm tra có phải từ đã được dùng hay không.
   * @param {String} phrase
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkIsRepeated(phrase, message) {
    const messages = [`Có thằng nối từ này rồi, chọn khác đê !`];

    if (!this.channelConfig.wordUsedList) return true;

    const startWord = phrase.split(" ")[0];
    if (this.channelConfig.wordUsedList[startWord]) {
      const cache = this.channelConfig.wordUsedList[startWord];
      if (cache[startWord]) {
        await this.noiChuError(message, messages[0]);
        return false;
      } else {
        this.channelConfig.wordUsedList[startWord][phrase] = { source: "any" };
        return true;
      }
    } else {
      this.channelConfig.wordUsedList[startWord] = {};
      this.channelConfig.wordUsedList[startWord][phrase] = { source: "any" };
      return true;
    }
  }

  /**
   * Check xem kênh đã đạt giới hạn nối chữ chưa
   * @param {Message} message
   * @returns {Promise<Boolean>}
   */
  async checkIsReachedMaxWords(message) {
    if (this.channelConfig.limit < 1) return true;
    const length = this.channelConfig.wordUsedList.split(",").length;
    if (length >= this.channelConfig.limit) {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Game nối chữ đã đạt max từ: *\`${this.channelConfig.limit}\`*`)
            .setDescription(`*Reset game !*`),
        ],
      });

      this.channelConfig.lastWord = "";
      this.channelConfig.lastUserId = "";
      this.channelConfig.wordUsedList = {};
      return true;
    }
    return false;
  }

  /**
   *
   * @param {String} phrase
   * @param {Message} message
   */
  async checkCanContinue(phrase, message) {
    const dictCache = require(`../../assets/noituTiengVietDictionaryCache.json`);

    const phraseLastWord = phrase.split(" ").reverse()[0];

    if (!this.channelConfig.wordUsedList[phraseLastWord])
      this.channelConfig.wordUsedList[phraseLastWord] = {};

    const sizeL = Object.keys(this.channelConfig.wordUsedList[phraseLastWord])?.length;
    const sizeD = dictCache[phraseLastWord] ? Object.keys(dictCache[phraseLastWord]).length : 0;

    if (sizeL >= sizeD) {
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Không còn từ có thể nối tiếp !`)
            .setDescription(`*Hãy bắt đầu bằng một từ mới*`)
            .setColor(Colors.Yellow),
        ],
      });
      this.channelConfig.lastUserId = "";
      this.channelConfig.lastWord = "";
      return false;
    }
    return true;
  }

  /**
   * @returns {Promise<String}
   */
  async getRamdomSuggetion() {
    try {
      const cache = require(`../../assets/noituTiengVietDictionaryCache.json`);
      const wordCache = cache[this.channelConfig.lastWord.split(" ").reverse()[0]];
      const wordUsedCache =
        this.channelConfig.wordUsedList[this.channelConfig.lastWord.split(" ").reverse()[0]];

      const results = [];

      for (const item in wordCache) {
        if (!wordUsedCache[item]) results.push(item);
      }

      return results[getRandomInt(0, results.length - 1)];
    } catch (error) {
      logger.errors.server(`Error on NoichuChecker: ${error}`);
    }
  }

  /**
   *
   * @param {Message} message
   */
  async check(message) {
    try {
      const authorId = message.author.id;

      if (message.content.startsWith(`>`)) return;
      if (!(await this.syncConfig())) return false;

      let phrase = message.content.toLowerCase();
      if (phrase.startsWith("<") || phrase.startsWith(":")) return;

      if (!(await this.checkLastUser(authorId, phrase, message))) return;
      if (!(await this.checkStartPhrase(phrase, message))) return;
      if (this.channelConfig.repeated === -1) {
        if (!(await this.checkIsRepeated(phrase, message))) return;
      }
      if (!(await this.checkPhrase(phrase, message))) return;

      message.react("✅");
      this.channelConfig.lastWord = phrase;
      this.channelConfig.lastUserId = authorId;

      await this.checkIsReachedMaxWords(message);
      await this.checkCanContinue(phrase, message);

      await this.channelConfig.update();
    } catch (error) {
      logger.errors.server(`Error on NoichuChecker: ${error}`);
    }
  }
}

module.exports = { NoichuGuildManager, NoichuChecker, NoituChecker };
