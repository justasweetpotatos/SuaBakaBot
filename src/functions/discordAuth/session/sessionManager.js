const { Collection, User, CommandInteraction, ButtonInteraction } = require("discord.js");

const { connector } = require("../../../database/connection");
const { Session } = require(`./session`);
const { sendNotificationEmbedMessage, MessageWarnLevel } = require(`../../../utils/message`);
const logger = require("../../../utils/logger");
const { PlayerProfile } = require("../storage/playerProfile");

class AuthSessionManager {
  constructor() {
    this.sessions = new Collection();
    this.playerProfiles = new Collection();
  }

  /**
   *
   * @returns {Promise<Collection<String, {
   *    uuid: String,
   *    name: String
   *    discord_id: String,
   *    ip: String,
   *    discord_verify_mode: Number
   * }>>}
   */
  async getPlayerProfiles() {
    const query = `SELECT * FROM minecraft_db.player_profiles;`;
    try {
      const results = await connector.executeQuery(query);
      const playerProfiles = new Collection();
      for (const profile of results) {
        const playerProfile = new PlayerProfile(profile.uuid);
        playerProfile.name = profile.name;
        playerProfile.ipAddress = profile.ip;
        playerProfile.discordId = profile.discord_id;
        playerProfiles.set(profile.uuid, playerProfile);
      }
      return playerProfiles;
    } catch (error) {
      logger.errors.database(`GET_PLAYER_PROFILE_ERROR: query>>${query}: ${error}`);
      return undefined;
    }
  }

  async syncPlayerProfiles() {
    this.playerProfiles = await this.getPlayerProfiles();
  }
  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {String} playerUUID
   */
  async createSession(interaction, playerUUID) {
    try {
      await this.syncPlayerProfiles();
      const user = interaction.user;
      if (this.isUserHasASession(user)) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Bạn chưa kết thúc phiên xác minh trước đó, vui lòng tắt trước khi mở một phiên xác minh mới !`,
          MessageWarnLevel.WARNING,
          true
        );
        return;
      }

      if (this.isLinkedDiscordAccount(user)) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `*Tài khoản này đã được bind, vui lòng gỡ bằng cách sử dụng \`/mc-server unlink\`*`,
          MessageWarnLevel.INFO,
          true
        );
        return;
      }

      if (this.isLinkedMinecraftAccount(playerUUID)) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `*Tài khoản minecraft này đã được bind, vui lòng chọn tài khoản khác !\nNếu có lỗi, hãy liên hệ ngay với admin !*`,
          MessageWarnLevel.WARNING,
          true
        );
        return;
      }

      const session = new Session(user.id, playerUUID);
      session.playerProfile = this.getPlayerProfileByUUID(playerUUID);
      this.sessions.set(user.id, session);

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Đây là mã xác minh của bạn: **${session.authCode}**
        Sử dụng lệnh \`/mc-server code\` để xác minh bằng mã này !
        Mã có hiệu lực trong 5 phút !`,
        MessageWarnLevel.INFO,
        true
      );

      setTimeout(() => {
        this.removeSession(user);
      }, 300000);
    } catch (error) {
      logger.errors.server(`CREATE_AUTH_SESSION_ERROR: User id>>${interaction.user.id}: ${error}`);
    }
  }

  /**
   *
   * @param {User} user
   */
  removeSession(user) {
    if (!this.isUserHasASession(user)) return;
    this.sessions.delete(user.id);
  }

  /**
   *
   * @param {User} user Discord user
   * @returns {Boolean}
   */
  isUserHasASession(user) {
    return this.sessions.has(user.id);
  }

  /**
   *
   * @param {User} user Discord user
   * @returns {Boolean}
   */
  isLinkedDiscordAccount(user) {
    let status = false;
    this.playerProfiles.forEach((profile) => {
      if (profile.discordId == user.id) status = true;
    });
    return status;
  }

  /**
   *
   * @param {String} playerUUID
   * @returns {Boolean}
   */
  isLinkedMinecraftAccount(playerUUID) {
    return this.playerProfiles.get(playerUUID).discordId ? true : false;
  }

  /**
   *
   * @param {User} user
   * @returns {PlayerProfile}
   */
  getPlayerProfile(user) {
    let result = undefined;
    this.playerProfiles.forEach((profile) => {
      if (profile.discordId == user.id) result = profile;
    });
    return result;
  }

  /**
   *
   * @param {String} playerUUID
   * @returns {PlayerProfile}
   */
  getPlayerProfileByUUID(playerUUID) {
    return this.playerProfiles.get(playerUUID);
  }

  /**
   * @param {User} user
   * @returns {Session}
   */
  getSession(user) {
    return this.sessions.get(user.id);
  }
}

module.exports = {
  AuthSessionManager,
};
