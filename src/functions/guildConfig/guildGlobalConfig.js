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
    this.name = name ? name : "";
    this.limOfNoichuChanel = limOfNoichuChanel ? 1 : limOfNoichuChanel;
    this.reportChannelId = "";
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
}

module.exports = { GuildGlobalConfig };
