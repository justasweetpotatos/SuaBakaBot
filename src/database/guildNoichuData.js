const { connector } = require("./connection");
const logger = require("../utils/logger");

module.exports = {
  /**
   *
   * @param {String} guildId
   * @param {String} guildName
   */
  async createNoichuGuildData(guildId, guildName) {
    const query = `
      INSERT INTO \`suwa-bot-guild-data\`.\`guilds\` (\`id\`, \`name\`) 
      VALUES (?, ?);
    `;

    const values = [guildId, guildName];

    await connector.executeQuery(query, values);
  },
  /**
   *
   * @param {String} guildId String of guild id.
   * @returns {Promise<Array<Object>>}
   */
  async getNoichuGuildData(guildId) {
    const selectQuery = `
    SELECT \`suwa-bot-guild-data\`.noichu_channels.* 
    FROM \`suwa-bot-guild-data\`.guilds right join \`suwa-bot-guild-data\`.noichu_channels 
    ON \`suwa-bot-guild-data\`.guilds.id = \`suwa-bot-guild-data\`.noichu_channels.guild_id 
    WHERE \`suwa-bot-guild-data\`.guilds.id = '${guildId}'
    `;

    return await connector.executeQuery(selectQuery);
  },
  /**
   *
   * @param {String} guildId
   */
  async getNoichuGuildConfig(guildId) {
    const selectQuery = `
    SELECT \`suwa-bot-guild-data\`.guilds.*
    FROM \`suwa-bot-guild-data\`.guilds
    WHERE \`suwa-bot-guild-data\`.guilds.id = '${guildId}'
    `;

    return await connector.executeQuery(selectQuery);
  },

  /**
   *
   * @param {String} channelId
   */
  async removeChannelGuildData(channelId) {
    const query = `DELETE FROM \`suwa-bot-guild-data\`.\`noichu_channels\` WHERE (\`id\` = ?);`;
    const values = [channelId];

    await connector.executeQuery(query, values);
  },
  /**
   *
   * @param {Array<Object>} guildData
   */
  async updateNoichuGuildData(guildData) {
    try {
      guildData.forEach(async (channel) => {
        const query = `
        INSERT INTO \`suwa-bot-guild-data\` (\`id\`, \`max_words\`, \`last_word\`, \`last_user_id\`, \`word_used_list\`, \`guild_id\`, \`repeated\`) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        max_words = VALUES(max_words),
        last_word = VALUES(last_word),
        last_user_id = VALUES(last_user_id),
        word_used_list = VALUES(word_used_list),
        repeated = VALUES(repeated)
        `;

        const values = [
          channel.id,
          channel.max_words,
          channel.last_word,
          channel.last_user_id,
          channel.word_used_list,
          channel.guild_id,
          channel.repeated ? channel.repeated : 1,
          channel.max_create ? channel.max_create : 1,
        ];

        await connector.executeQuery(query, values);
      });
    } catch (error) {}
  },
};
