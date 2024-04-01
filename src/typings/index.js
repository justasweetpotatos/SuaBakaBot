const logger = require("../utils/logger");
const { connector } = require("../database/connection");
const { EmbedBuilder, Colors, Embed, Role } = require("discord.js");
const { GuildGlobalConfig } = require("../functions/guildConfig/guildGlobalConfig");

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
   * @param {String} channelId
   * @param {String} guildId
   */
  constructor(channelId, guildId) {
    // Data
    this.id = null;
    this.guildId = null;
    this.lastWord = "";
    this.lastUserId = "";
    this.wordUsedList = "";

    // Rules
    this.registed = false;
    this.repeated = -1;
    this.limit = 100;

    // Messages
    this.wrongWordMessages = [];
    this.wrongStartCharMessages = [];
    this.isBeforeUserMessages = [];
    this.isRepeatedWordMessages = ["<Có thằng nối từ này rồi, chọn khác đê !>"];

    // guild DB name
    this.guildDBName = `guild_`;

    if (channelId && guildId) {
      this.id = channelId;
      this.guildId = guildId;
      this.guildDBName += `${guildId}`;
      return this;
    } else throw new Error(`Variable channelId and guildId is missing !`);
  }

  /**
   *
   * @param {Number} messageType
   * @param {string} message
   * @returns {Boolean}
   */
  async addMessage(messageType, message) {
    let valid = true;
    switch (messageType) {
      case 1:
        if (!this.wrongWordMessages.includes(message)) this.wrongWordMessages.push(`<${message}>`);
        valid = true;
        break;
      case 2:
        if (!this.wrongStartCharMessages.includes(message)) this.wrongStartCharMessages.push(`<${message}>`);
        valid = true;
        break;
      case 3:
        if (!this.isBeforeUserMessages.includes(message)) this.isBeforeUserMessages.push(`<${message}>`);
        valid = true;
        break;
      case 4:
        if (!this.isRepeatedWordMessages.includes(message)) this.isRepeatedWordMessages.push(`<${message}>`);
        valid = true;
        break;
      default:
        valid = false;
        vvvxx;
        break;
    }

    if (valid) return await this.sync();
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const guildGlbConfig = new GuildGlobalConfig(this.guildId);
      if (!(await guildGlbConfig.checkingGuildDB(this.guildId))) await guildGlbConfig.createGuildDB();

      const query = `
        SELECT * FROM ${this.guildDBName}.noichu_channels
        WHERE id = ?
      `;
      const values = [this.id];
      const results = await connector.executeQuery(query, values);

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
      logger.errors.database(`Error on syncing config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>} Nếu trả về true, cập nhật thành công và ngược lại
   */
  async update() {
    try {
      const query = `
        INSERT INTO ${this.guildDBName}.noichu_channels
        (id, last_user_id, last_word, word_used_list, \`limit\`, repeated, wrong_word_messages, wrong_startchar_messages, is_before_user_messages, is_repeated_word_messages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      await connector.executeQuery(query, values);
      return true;
    } catch (err) {
      logger.errors.database(`Error in updating config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<boolean>}
   */
  async delete() {
    try {
      const query = `
        DELETE FROM ${this.guildDBName}.noichu_channels
        WHERE id = ?
      `;
      const values = [this.id];
      await connector.executeQuery(query, values);
      return true;
    } catch (err) {
      logger.errors.database(`Error in deleting config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Embed>}
   */
  createConfigEmbed() {
    return new EmbedBuilder()
      .setTitle(`Cài đặt game nối chữ kênh <#${this.id}> :`)
      .setDescription(
        `***Configuration:***
            Channel id: ${this.id}
            Last user: ${this.lastUserId.length === 0 ? "none" : `<@${this.lastUserId}>`}
            Last word: ${this.lastWord ? this.lastWord : "none"}
            Max words: ${this.limit}
            Repeated: ${this.repeated === 1 ? "✅" : "❌"}

            ***Hướng dẫn:***
            \`Remove\`: Xóa config nối chữ của kênh !
            \`Set Max\`: Set giới hạn từ trước khi reset game !
            \`Set Repeated\`: Cho phép lặp hoặc không ! 
        `
      )
      .setColor(Colors.Blurple);
  }
}

class NoituTiengVietChannelConfig {
  /**
   *
   * @param {String} channelId
   * @param {String} guildId
   */
  constructor(channelId, guildId) {
    // Data
    this.id = null;
    this.guildId = null;
    this.lastWord = "";
    this.lastUserId = "";
    this.wordUsedList = {};

    // Rules
    this.registed = false;
    this.repeated = -1;
    this.limit = 100;

    // Messages
    this.wrongWordMessages = [];
    this.wrongStartCharMessages = [];
    this.isBeforeUserMessages = [];
    this.isRepeatedWordMessages = ["<Có thằng nối từ này rồi, chọn khác đê !>"];

    // guild DB name
    this.guildDBName = `guild_`;

    if (channelId && guildId) {
      this.id = channelId;
      this.guildId = guildId;
      this.guildDBName += `${guildId}`;
      return this;
    } else throw new Error(`Variable channelId and guildId is missing !`);
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const guildGlbConfig = new GuildGlobalConfig(this.guildId);
      if (!(await guildGlbConfig.checkingGuildDB(this.guildId))) await guildGlbConfig.createGuildDB();

      const query = `
        SELECT * FROM ${this.guildDBName}.noitu_channels
        WHERE id = ?
      `;
      const values = [this.id];
      const results = await connector.executeQuery(query, values);

      if (results.length === 0) return false;
      else {
        const config = results[0];
        this.lastWord = config.last_word;
        this.lastUserId = config.last_user_id;
        this.wordUsedList = JSON.parse(config.word_used_list);
        this.repeated = config.repeated;
        this.limit = config.limit;
        this.wrongWordMessages = config.wrong_word_messages?.split("///");
        this.wrongStartCharMessages = config.wrong_startchar_messages?.split("///");
        this.isBeforeUserMessages = config.is_before_user_messages?.split("///");
        this.isRepeatedWordMessages = config.is_repeated_word_messages?.split("///");
        return true;
      }
    } catch (err) {
      logger.errors.database(`Error on syncing config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>} Nếu trả về true, cập nhật thành công và ngược lại
   */
  async update() {
    try {
      const query = `
        INSERT INTO ${this.guildDBName}.noitu_channels
        (id, last_user_id, last_word, word_used_list, \`limit\`, repeated, wrong_word_messages, wrong_startchar_messages, is_before_user_messages, is_repeated_word_messages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

        this.lastUserId,
        this.lastWord,
        JSON.stringify(this.wordUsedList),

        this.limit,
        this.repeated,

        this.wrongWordMessages.join("///"),
        this.wrongStartCharMessages.join("///"),
        this.isBeforeUserMessages.join("///"),
        this.isRepeatedWordMessages.join("///"),
      ];
      await connector.executeQuery(query, values);
      return true;
    } catch (err) {
      logger.errors.database(`Error in updating config of channel with id ${this.id}: ${err}`);
      return false;
    }
  }
}

class GuildConfig {
  /**
   *
   * @param {String} id
   * @param {String} name
   * @param {Number} limOfNoichuChannel
   * @param {JSON<Role>} botManagerRoles
   */
  constructor(id, name, limOfNoichuChannel) {
    this.id = null;
    this.name = "";
    this.limOfNoichuChannel = 1;
    this.botManagerRoles = {};

    if (!id) throw new Error(`Id must not be null`);

    this.id = id;
    this.name = name ? name : "";
    this.limOfNoichuChannel = limOfNoichuChannel ? limOfNoichuChannel : 1;
    this.guildDBName = `guild_${id}`;
  }

  async getNumberOfNoichuChannelInGuild() {
    try {
      await this.sync();

      const query = `SELECT COUNT(*) AS \`count\` FROM ${this.guildDBName}.noichu_channels;`;
      return await connector.executeQuery(query)[0]?.count;
    } catch (error) {
      logger.errors.database(
        `Error on getting number of noichu channel in guild with id ${this.id}: ${error}`
      );
    }
  }

  async checkDB() {
    try {
    } catch (error) {}
  }

  async sync() {
    try {
      const guildGlbConfig = new GuildGlobalConfig(this.id);
      if (!(await guildGlbConfig.checkingGuildDB(this.id))) await guildGlbConfig.createGuildDB();

      const query = `
        SELECT * FROM ${this.guildDBName}.guild_info
      `;
      const results = await connector.executeQuery(query);

      if (results.length === 0) return false;
      else {
        this.name = results[0].name;
        this.limOfNoichuChannel = results[0].lim_of_noichu_channel;
      }
      return true;
    } catch (err) {
      logger.errors.database(`Error on syncing data from guild DB name ${this.guildDBName}: ${err}`);
      return false;
    }
  }
  /**
   * Cập nhật dữ liệu lên DB
   * @param {String} name Tên của guild
   * @param {Number} limOfNoichuChannel Số lượng tối đa channel có thể set game nối chữ
   */
  async update(name, limOfNoichuChannel) {
    try {
      name ? (this.name = name) : "";
      limOfNoichuChannel ? (this.limOfNoichuChannel = limOfNoichuChannel) : "";

      const query = `
        INSERT INTO ${this.guildDBName}.guild_info (id, \`name\`, lim_of_noichu_channel, manager_roles) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        \`name\` = VALUES(\`name\`),
        lim_of_noichu_channel = VALUES(lim_of_noichu_channel),
        manager_roles = VALUES(manager_roles);
      `;
      const values = [this.id, this.name, this.limOfNoichuChannel, this.botManagerRoles];
      console.log(query);
      console.log(values);
      await connector.executeQuery(query, values);
      return true;
    } catch (err) {
      logger.errors.database(`Error on updating data to guild DB name ${this.guildDBName}: ${err}`);
    }
  }
}

class ReactionRoleMessageConfig {
  /**
   *
   * @param {String} messageId
   * @param {String} emojiId
   */
  constructor(messageId, emojiId, guildId) {
    this.id = messageId;
    this.emojiId = emojiId;
    this.guildId = guildId;
    if (!(this.id && this.emojiId && guildId)) throw new Error(`messageId, emojiId, guildId required !`);
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const query = `
        SELECT * FROM guild_${this.guildId}.reaction_emojis WHERE id = ${this.id} AND emoji_id = ${this.emojiId};
      `;

      const result = (await connector.executeQuery(query, []))[0];
      if (!result) return false;

      this.roleList = result.role_list;

      return true;
    } catch (error) {
      logger.errors.database(
        `Error on syncing data of reaction role with message id ${this.id} with role id ${this.emojiId}: ${error}`
      );
    }
  }

  async update() {}

  async delete() {}
}

module.exports = { NoichuChannelConfig, GuildConfig, NoituTiengVietChannelConfig, noichuMessageTypes };
