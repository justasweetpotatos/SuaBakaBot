const { connector } = require("../../database/connection");
const logger = require("../../utils/logger");

class GuildGlobalConfig {
  /**
   *
   * @param {String} id
   * @param {String} name
   */
  constructor(id, name, limOfNoichuChanel) {
    this.id = id;
    if (!this.id) throw new Error(`Id required !`);
    this.name = name ? name : "none";
    this.limOfNoichuChanel = limOfNoichuChanel ? 1 : limOfNoichuChanel;
    this.reportChannelId = "none";
  }

  async update() {
    try {
      const query = `
      INSERT INTO guild_${this.id}.guild_info
      (id, name, lim_of_noichu_channel, report_channel_id)
      VALUES(?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      \`name\` = VALUES(\`name\`),
      lim_of_noichu_channel = VALUES(lim_of_noichu_channel),
      report_channel_id = VALUES(report_channel_id);
      `;
      const values = [this.id, this.name, this.limOfNoichuChanel, this.reportChannelId];
      await connector.executeQuery(query, values);
      return true;
    } catch (error) {
      logger.errors.database(`Error on updating data of guild with id ${this.id}: ${error}`);
      return false;
    }
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const query = `SELECT * FROM guild_${this.id}.guild_info WHERE id = ?`;
      const values = [this.id];
      const result = (await connector.executeQuery(query, values))[0];
      this.name = result.name;
      this.limOfNoichuChanel = result.lim_of_noichu_channel;
      this.reportChannelId = result.report_channel_id;
      return true;
    } catch (error) {
      logger.errors.database(`Error on syncing data of guild with id ${this.id}: ${error}`);
      return false;
    }
  }

  /**
   * Tìm kiếm trên database xem đã có db của guild hay chưa, nếu chưa tạo mới db
   * @returns {any}
   */
  async createGuildDB() {
    // DB components
    const DBName = `guild_${this.id}`;

    try {
      // Create DB
      const createDBQuery = `CREATE SCHEMA IF NOT EXISTS ${DBName}`;
      await connector.executeQuery(createDBQuery, []);

      // Create tables
      const tableCreateQuerys = [
        {
          name: `guild_info`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.guild_info LIKE guild_template.guild_info;`,
          alterTableQuery: `ALTER TABLE ${DBName}.guild_info ADD PRIMARY KEY (id);`,
        },
        {
          name: `noichu_channels`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.noichu_channels LIKE guild_template.noichu_channels;`,
          alterTableQuery: ``,
        },
        {
          name: `reaction_buttons`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.reaction_buttons LIKE guild_template.reaction_buttons;`,
          alterTableQuery: ``,
        },
        {
          name: `reaction_emojis`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.reaction_emojis LIKE guild_template.reaction_emojis;`,
          alterTableQuery: ``,
        },
        {
          name: `confession_channels`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.confession_channels LIKE guild_template.confession_channels;`,
          alterTableQuery: ``,
        },
        {
          name: `confession_posts`,
          createQuery: `CREATE TABLE IF NOT EXISTS ${DBName}.confession_posts LIKE guild_template.confession_posts;`,
          alterTableQuery: ``,
        },
      ];

      for (const table of tableCreateQuerys) {
        try {
          await connector.executeQuery(table.createQuery);
        } catch (error) {
          logger.errors.database(
            `Error on creating table name ${table.name} of guild with id ${this.id}: ${error}`
          );
        }
      }
    } catch (error) {
      logger.error(`Error on creating guild DB with name ${DBName}: ${error}`);
    }
  }

  /**
   * Tìm kiếm trên database xem đã có db của guild hay chưa, nếu chưa tạo mới db
   * @param {String} guildId
   * @returns {any}
   */
  async checkingGuildDB(guildId) {
    try {
      const query = `
        SELECT * FROM guild_${guildId}.guild_info
      `;
      await connector.executeQuery(query);
    } catch (error) {
      if (error && error.code === "ER_BAD_DB_ERROR") {
        await this.createGuildDB(guildId);
        logger.log.database(
          `Created DB for guild with id ${guildId} and with name guild_${guildId}, reason: No DB with name: guild_${guildId}`
        );
        return true;
      } else logger.error(`Error on cheking guild DB with id ${guildId}: ${error}`);
    }
  }
}

module.exports = { GuildGlobalConfig };
