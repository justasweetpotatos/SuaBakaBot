const { connector } = require("../../database/connection");
const logger = require("../logger");

class GuildDBInitial {
  constructor(guiidId) {
    this.guiidId = guiidId;
    if (!this.guiidId) throw new Error(`CREATE_VARIABLE_ERROR: No guild id was given !`);
    this.DBName = `guild_${this.guiidId}`;
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async isExistDB() {
    try {
      const query = `SELECT * FROM ${this.DBName}.guild_info`;
      const results = await connector.executeQuery(query, []);
      if (results[0]) return true;
      return false;
    } catch (error) {
      logger.errors.database(`SELECT_DB_ERROR: guild>>${this.guiidId}: ${error}`);
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async createGuildDB() {
    try {
      if (!(await this.createGuildSchema()))
        throw new Error(`CREATE_GUILD_DB_ERROR: Can't resolve function !`);
      if (!(await this.createGuildTables()))
        throw new Error(`CREATE_GUILD_DB_ERROR: Can't resolve function !`);
      return true;
    } catch (error) {
      logger.errors.database(
        `CREATE_DB_ERROR: Can't resolve function. DESCRIPTION: guild>>${this.guiidId} ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @param {String} guiidId
   */
  async createGuildSchema(guiidId) {
    try {
      const DBName = `guild_${guiidId}`;
      const createDBQuery = `CREATE SCHEMA IF NOT EXISTS ${DBName}`;
      await connector.executeQuery(createDBQuery, []);
      return true;
    } catch (error) {
      logger.errors.database(`CREATE_SCHEMA_ERROR: guild ${guiidId}: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {String} guiidId
   * @returns {Promise<Boolean>}
   */
  async createGuildTables() {
    // Create tables
    const tableCreateQuerys = [
      {
        name: `guild_info`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.guild_info LIKE guild_template.guild_info;`,
        alterTableQuery: `ALTER TABLE ${this.DBName}.guild_info ADD PRIMARY KEY (id);`,
      },
      {
        name: `noichu_channels`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.noichu_channels LIKE guild_template.noichu_channels;`,
        alterTableQuery: ``,
      },
      {
        name: `reaction_buttons`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.reaction_buttons LIKE guild_template.reaction_buttons;`,
        alterTableQuery: ``,
      },
      {
        name: `reaction_emojis`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.reaction_emojis LIKE guild_template.reaction_emojis;`,
        alterTableQuery: ``,
      },
      {
        name: `confession_channels`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.confession_channels LIKE guild_template.confession_channels;`,
        alterTableQuery: ``,
      },
      {
        name: `confession_posts`,
        createQuery: `CREATE TABLE IF NOT EXISTS ${this.DBName}.confession_posts LIKE guild_template.confession_posts;`,
        alterTableQuery: ``,
      },
    ];

    for (const table of tableCreateQuerys) {
      try {
        await connector.executeQuery(table.createQuery);
        await connector.executeQuery(table.alterTableQuery);
      } catch (error) {
        logger.errors.database(`CREATE_TABLE_ERROR: guild>>${this.guiidId} table>>${table.name}: ${error}`);
        return false;
      }
    }
    return true;
  }
}

module.exports = { GuildDBInitial };
