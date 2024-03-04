const { Colors } = require("discord.js");
const { runQuery } = require("../database/connection");
const logger = require("../utils/logger");

const noichuMessageTypes = {
  wrongWordMessages: 1,
  wrongLastCharMessages: 2,
  isBeforeUserMessages: 3,
  isRepeatedWordMessages: 4,
};

String.prototype.removeCharacter = function (character) {
  return this.split(character).join("");
};

class NoichuChannelConfig {
  /**
   *
   * @param {String} id
   * @param {String} guildId
   * @param {{id: String,
   * max_words: Number,
   * last_word: String,
   * word_used_list: String,
   * last_user_id: String,
   * guild_id: String,
   * repeated: Number,
   * wrong_word_messages: String,
   * wrong_startchar_messages: String,
   * is_before_user_messages: String,
   * is_repeated_word_messages: String
   * }} rowDataFromDB
   */
  constructor(rowDataFromDB, id, guildId) {
    // Data
    this.id = null;
    this.guildId = null;
    this.lastWord = null;
    this.lastUserId = null;
    this.wordUsedList = null;

    // Rules
    this.registed = false;
    this.repeated = -1;
    this.limit = 100;

    // Messages
    this.wrongWordMessages = [];
    this.wrongStartCharMessages = [];
    this.isBeforeUserMessages = [];
    this.isRepeatedWordMessages = ["<Có thằng nối từ này rồi, chọn khác đê !>"];

    if (rowDataFromDB) {
      if (rowDataFromDB.id && rowDataFromDB.guild_id) {
        this.id = rowDataFromDB.id;
        this.guildId = rowDataFromDB.guild_id;
        this.limit = rowDataFromDB.limit;
        this.lastWord = rowDataFromDB.last_word;
        this.wordUsedList = rowDataFromDB.word_used_list;
        this.lastUserId = rowDataFromDB.last_user_id;
        this.repeated = rowDataFromDB.repeated < 0 ? false : true;
        this.wrongWordMessages = rowDataFromDB.wrong_word_messages?.split("><");
        this.wrongStartCharMessages = rowDataFromDB.wrong_startchar_messages?.split("><");
        this.isBeforeUserMessages = rowDataFromDB.is_before_user_messages?.split("><");
        this.isRepeatedWordMessages = rowDataFromDB.is_repeated_word_messages?.split("><");
        return this;
      }
    }

    if (id && guildId) {
      this.id = id;
      this.guildId = guildId;
      return this;
    } else throw new Error(`Variable id and guildId is missing !`);
  }

  addMessage(messageType, message) {
    switch (messageType) {
      case 1:
        if (!this.wrongWordMessages.includes(message)) {
          this.wrongWordMessages.push(`<${message}>`);
        }
        break;
      case 2:
        if (!this.wrongStartCharMessages.includes(message)) {
          this.wrongStartCharMessages.push(`<${message}>`);
        }
        break;
      case 3:
        if (!this.isBeforeUserMessages.includes(message)) {
          this.isBeforeUserMessages.push(`<${message}>`);
        }
        break;
      case 4:
        if (!this.isRepeatedWordMessages.includes(message)) {
          this.isRepeatedWordMessages.push(`<${message}>`);
        }
        break;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>} Nếu trả về true, cập nhật thành công và ngược lại
   */
  async update() {
    try {
      const query = `
        INSERT INTO \`suwa-bot-guild-data\`.\`noichu_channels\`
        (id, guild_id, last_user_id, last_word, word_used_list, \`limit\`, repeated, wrong_word_messages, wrong_startchar_messages, is_before_user_messages, is_repeated_word_messages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        last_word = VALUES(last_word),
        last_user_id = VALUES(last_user_id),
        word_used_list = VALUES(word_used_list),
        repeated = VALUES(repeated),
        \`limit\` = VALUES(\`limit\`),
        wrong_word_messages = VALUES(wrong_word_messages),
        wrong_startchar_messages = VALUES(wrong_startchar_messages),
        is_before_user_messages = VALUES(is_before_user_messages),
        is_repeated_word_messages = VALUES(is_repeated_word_messages)
      `;
      const values = [
        this.id,
        this.guildId,

        this.lastUserId,
        this.lastWord,
        this.wordUsedList,

        this.limit,
        this.repeated,

        this.wrongWordMessages.join("///"),
        this.wrongStartCharMessages.join("///"),
        this.isBeforeUserMessages.join("///"),
        this.isRepeatedWordMessages.join("///"),
      ];
      await runQuery(query, values);
      return true;
    } catch (err) {
      logger.error(`Error in updating config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const query = `
          SELECT * FROM \`suwa-bot-guild-data\`.noichu_channels
          WHERE id = ?
        `;
      const values = [this.id];
      const results = await runQuery(query, values);

      if (results.length === 0) return false;
      else {
        const config = results[0];
        this.lastWord = config.last_word;
        this.lastUserId = config.last_user_id;
        this.wordUsedList = config.word_used_list;
        this.repeated = config.repeated;
        this.limit = config.limit;
        this.wrongWordMessages = config.wrong_word_messages?.split("///");
        this.wrongStartCharMessages = config.wrong_startchar_messages?.split("///");
        this.isBeforeUserMessages = config.is_before_user_messages?.split("///");
        this.isRepeatedWordMessages = config.is_repeated_word_messages?.split("///");

        return true;
      }
    } catch (err) {
      logger.error(`Error in syncing config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  async delete() {
    try {
      const query = `
        DELETE FROM \`suwa-bot-guild-data\`.noichu_channels
        WHERE id = ?
      `;
      const values = [this.id];
      await runQuery(query, values);
      return true;
    } catch (err) {
      logger.error(`Error in syncing config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }
}

class GuildConfig {
  /**
   *
   * @param {String} id
   * @param {String} name
   * @param {Number} maxNoichuChannel
   */
  constructor(id, name, maxNoichuChannel) {
    this.id = null;
    this.name = "";
    this.maxNoichuChannel = 1;

    if (!id) throw new Error(`Id must not be null`);

    this.id = id;
    this.name = name ? name : "";
    this.maxNoichuChannel = maxNoichuChannel ? maxNoichuChannel : 1;
  }

  async sync() {
    try {
      const query =   `
        SELECT * FROM \`suwa-bot-guild-data\`.guilds
        WHERE id = ?
      `;
      const values = [this.id];
      const results = await runQuery(query, values);

      if (results.length === 0) return false;
      else {
        this.name = results[0].name;
        this.maxNoichuChannel = results[0].max_noichu_channel;
      }
      return true;
    } catch (err) {
      logger.error(`Error on syncing data from DB of guild with id ${this.id}: ${err}`);
      return false;
    }
  }
  /**
   * Cập nhật dữ liệu lên DB
   * @param {String} name Tên của guild
   * @param {Number} maxNoichuChannel Số lượng tối đa channel có thể set game nối chữ
   */
  async update(name, maxNoichuChannel) {
    try {
      name ? (this.name = name) : "";
      maxNoichuChannel ? (this.maxNoichuChannel = maxNoichuChannel) : "";

      const query = `
        INSERT INTO \`suwa-bot-guild-data\`.guilds (id, name, max_noichu_channel) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY 
        UPDATE 
        name = VALUES(name),
        max_noichu_channel = VALUES(max_noichu_channel)
      `;
      const values = [this.id, this.name, this.maxNoichuChannel];
      await runQuery(query, values);
      return true;
    } catch (err) {
      logger.error(`Error on updating data to DB of guild with id ${this.id}: ${err}`);
    }
  }
}

module.exports = { NoichuChannelConfig, GuildConfig, noichuMessageTypes };
