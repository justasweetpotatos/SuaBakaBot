const { GuildConfig } = require("../typings");
const logger = require("../utils/logger");
const { connector } = require("./connection");

class DBSelector {
  /**
   *
   * @param {String} guildId
   * @returns {GuildConfig | undefined}
   */
  async selectConfigTable(guildId) {
    try {
      const query = `
        SELECT * FROM guild_${this.guildId}.guild_config
      `;

      const result = await connector.executeQuery(query, []);

      if (!result) return undefined;
      const guildConfig = new GuildConfig(this.guildId);

      guildConfig.guildDBName = result.name;
      guildConfig.limOfNoichuChannel = result.lim_of_noichu_channel;
      guildConfig.botManagerRoles = result.manager_roles;

      return guildConfig;
    } catch (error) {
      logger.errors.database(`GUILD_DB_CONFIG_TABLE_SELECT_ERROR: guild_${this.guildId} ${error}`);
    }
  }

  /**
   *
   * @param {String} guildId
   */
  async createGuildDB(guildId) {
    // DB components
    const DBName = `guild_${guildId}`;

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
            `GUILD_DB_CREATE_TABLE_ERROR: table>>${table.name} guiid_id>>${guildId}: ${error}`
          );
        }
      }
    } catch (error) {
      logger.errors.database(`GUILD_DB_CREATE_DB_ERROR: guiid_id>>${guildId}: ${error}`);
    }
  }
}

module.expports = {};
