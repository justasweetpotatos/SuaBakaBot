const { PlayerProfile } = require("./storage/playerProfile");
const { connector } = require(`../../database/connection`);
const logger = require("../../utils/logger");

class PlayerRepository {
  /**
   *
   * @param {PlayerProfile} playerProfile
   * @returns {Promise<Boolean>}
   */
  async isExistProfile(playerProfile) {
    try {
      const query = `SELECT * FROM minecraft_db.player_profiles WHERE uuid = ${playerProfile.uuid}`;
      const result = (await connector.executeQuery(query))[0];
      if (!result) return false;
      return true;
    } catch (error) {
      logger.errors.database(`SELECT_PLAYER_PROFILE_ERROR: Player uuid>>${playerProfile.uuid}: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {PlayerProfile} playerProfile
   * @returns {Promise<Boolean>}
   */
  async syncProfile(playerProfile) {
    try {
      const query = `SELECT * FROM minecraft_db.player_profiles WHERE uuid = ${playerProfile.uuid}`;
      const result = (await connector.executeQuery(query))[0];
      playerProfile.name = result.name;
      playerProfile.authMode = result.discrod_auth_mode;
      playerProfile.discordId = result.discord_id;
      return true;
    } catch (error) {
      logger.errors.database(`SELECT_PLAYER_PROFILE_ERROR: Player uuid>>${playerProfile.uuid}: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {PlayerProfile} playerProfile
   * @returns {Promise<Boolean>}
   */
  async updateProfile(playerProfile) {
    try {
      const query = `
            UPDATE player_profiles
            SET discord_id = ?, discord_verify_mode = ?
            WHERE uuid = ?;
        `;
      const values = [playerProfile.discordId, playerProfile.authMode, playerProfile.uuid];
      await connector.executeQuery(query, values);
      return true;
    } catch (error) {
      logger.errors.database(`SELECT_PLAYER_PROFILE_ERROR: Player uuid>>${playerProfile.uuid}: ${error}`);
      return false;
    }
  }
}

module.exports = { PlayerRepository };
