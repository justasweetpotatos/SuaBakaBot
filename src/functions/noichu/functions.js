const { EmbedBuilder, Colors, Message } = require("discord.js");
const { NoichuChannelConfig, NoituChannelConfig } = require(`../../typings/index`);
const logger = require("../../utils/logger");
const { NoichuChannelConfigRepository, NoituChannelConfigRepository } = require("../../database/repository");

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
    this.noichuChannelConfigRepository = new NoichuChannelConfigRepository();
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async syncConfig() {
    try {
      return await this.noichuChannelConfigRepository.sync(this.channelConfig);
    } catch (error) {
      logger.errors.server(
        `NOICHU_SYNC_CONFIG_ERROR: guild>>${this.guildId} channel>>${this.channelId}: ${error}`
      );
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
      const messages = Object.values(this.channelConfig.wrongWordMessages).map(value => (value));
      await this.noiChuError(message, messages[getRandomInt(0, messages.length - 1)].content);
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
    const messages = Object.values(this.channelConfig.isBeforeUserMessages).map(value => (value));

    if (this.channelConfig.lastUserId) {
      if (this.channelConfig.lastUserId === authorId) {
        await this.noiChuError(message, messages[getRandomInt(0, messages.length - 1)].content);
        return false;
      }
    } else return await this.checkWord(word, message);

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

    const messages = Object.values(this.channelConfig.wrongStartCharMessages).map(value => (value));
    const lastChar = this.channelConfig.lastWord.charAt(this.channelConfig.lastWord.length - 1);

    const e = `Đần, mày phải bắt đầu bằng \`${lastChar}\` chứ :|| !`;

    if (!word.startsWith(lastChar)) {
      await this.noiChuError(message, messages[getRandomInt(0, messages.length - 1)].content.replace("<replace>", lastChar));
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
    const messages = Object.values(this.channelConfig.isRepeatedWordMessages).map(value => (value));

    if (!this.channelConfig.wordUsedList) return true;

    const object = ((inputString) => {
      return inputString.split(" ").reduce((obj, item, index) => {
        obj[item] = item;
        return obj;
      }, {});
    })(this.channelConfig.wordUsedList);

    if (object[word]) {
      await this.noiChuError(message, messages[getRandomInt(0, messages.length - 1)].content);
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

      await this.noichuChannelConfigRepository.update(this.channelConfig);
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
    this.channelConfig = new NoituChannelConfig(channelId, guildId);
    this.repository = new NoituChannelConfigRepository();
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async syncConfig() {
    try {
      return await this.repository.sync(this.channelConfig);
    } catch (error) {
      logger.errors.server(
        `SYNC_NOITU_CONFIG_ERROR: guild>>${this.guildId} channel>>${this.channelConfig.id}: ${error}`
      );
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
      repliedMessage?.deletable ? await repliedMessage?.delete() : "";
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

    if (phrase.split(" ").length <= 1) return false;

    if (!dict[phrase]) {
      const messages = this.channelConfig.wrongWordMessages;
      await this.noiChuError(
        message,
        messages.at(getRandomInt(0, this.channelConfig.wrongWordMessages.length))
      );
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
      if (cache[phrase]) {
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
      logger.errors.server(`Error on NoituChecker: ${error}`);
    }
  }

  /**
   *
   * @param {Message} message
   */
  async check(message) {
    try {
      const authorId = message.author.id;

      if (message.content.startsWith(`>`)) return false;
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

      await this.repository.update(this.channelConfig);
    } catch (error) {
      logger.errors.server(`Error on NoituChecker: ${error}`);
    }
  }
}

module.exports = { NoichuChecker, NoituChecker };
