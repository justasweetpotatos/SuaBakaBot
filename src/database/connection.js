const mysql = require("mysql");
const logger = require("../utils/logger");
const host = `localhost`;
const user = `root`;
const password = `MySQLServer`;

class Connector {
  constructor() {
    this.adminConnection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "MySQLServer",
    });
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
      await this.executeQuery(query);
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

  /**
   * Tạo mới DB
   * @param {String} guildId
   * @returns {Promise<void>}
   */
  async createGuildDB(guildId) {
    try {
      // Tạo mới DB
      const guildDBName = `guild_${guildId}`;
      const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${guildDBName}`;
      await this.adminConnection.query(createDatabaseQuery);

      // Tạo các bảng cần thiết
      const tableQueries = [
        `CREATE TABLE IF NOT EXISTS ${guildDBName}.guild_info LIKE guild_template.guild_info;`,
        `CREATE TABLE IF NOT EXISTS ${guildDBName}.noichu_channels LIKE guild_template.noichu_channels;`,
        `CREATE TABLE IF NOT EXISTS ${guildDBName}.reaction_buttons LIKE guild_template.reaction_buttons;`,
        `CREATE TABLE IF NOT EXISTS ${guildDBName}.reaction_emojis LIKE guild_template.reaction_emojis;`,
      ];

      for (const query of tableQueries) {
        await this.executeQuery(query);
      }
    } catch (error) {
      logger.error(`Error on creating guild DB with name ${guildDBName}: ${error}`);
      throw error;
    }
  }

  /**
   * Chạy query
   * @param {String} query
   * @param {Array<any>} values
   * @returns {Promise<any>}
   */
  async executeQuery(query, values) {
    return new Promise((resolve, reject) => {
      this.adminConnection.query(query, values, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

const connector = new Connector();

module.exports = { connector };
