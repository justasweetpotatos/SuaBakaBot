const { Guild, Collection, User, CommandInteraction, ButtonInteraction, Colors } = require("discord.js");

const { connector } = require("../../../database/connection");
const { Session } = require(`./session`);
const { sendNotificationEmbedMessage, MessageWarnLevel } = require(`../../../utils/message`);

class AuthSessionManager {
  /**
   *
   * @param {Guild} guild
   */
  constructor(guild) {
    this.guild = guild;
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
    try {
      const query = `SELECT * FROM minecraft_db.player_profiles;`;
      const results = await connector.executeQuery(query);
      const playerProfiles = new Collection();
      for (const profile of results) {
        playerProfiles.set(profile.uuid, profile);
      }
      return playerProfiles;
    } catch (error) {}
  }

  /**
   *
   * @param {User} User
   */
  isUserHasASession(User) {
    let status = false;
    this.sessions.forEach((session) => {
      session.userId == User.id ? (status = true) : "";
    });
    return status;
  }

  /**
   *
   * @param {User} user
   * @returns {Session}
   */
  getSession(user) {
    let resSession = undefined;
    this.sessions.forEach((session) => {
      session.userId == user.id ? (resSession = session) : "";
    });
    return resSession;
  }

  /**
   *
   * @param {String} playerUUID
   * @returns {Boolean}
   */
  isMinecraftLinkedAccount(playerUUID) {
    let status = false;
    if (this.playerProfiles.get(playerUUID)?.discord_id) status = true;
    return status;
  }

  /**
   *
   * @param {User} user
   * @returns {Boolean}
   */
  isDiscordLinkedAccount(user) {
    let status = false;
    this.playerProfiles.forEach((profile) => {
      if (profile.discord_id == user.id) status = true;
    });
    return status;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {User} user
   * @param {String} playerUUID
   */
  async createAuthSession(interaction, user, playerUUID) {
    this.playerProfiles = await this.getPlayerProfiles();
    if (this.isMinecraftLinkedAccount(playerUUID)) {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `*Đã có tài khoản discord liên kết với tài khoản minecraft này !*`,
        MessageWarnLevel.INFO,
        true
      );
      return;
    }

    if (this.isDiscordLinkedAccount(user)) {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `*Tài khoản này đã được bind, vui lòng gỡ bằng cách sử dụng \`/mc-server unlink\`*`,
        MessageWarnLevel.INFO,
        true
      );
      return;
    }

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

    const sessionId = new Date().getTime().toString();
    const session = new Session(sessionId, user.id);
    session.playerUUID = playerUUID;
    this.sessions.set(user.id, session);

    await sendNotificationEmbedMessage(
      interaction,
      undefined,
      `**Đây lã mã xác minh của bạn: ${session.authCode}**
      **Hãy dùng lệnh \`/mc-server code\` để xác minh !**
      **Mã có hiệu lực trong 5 phút.**`,
      MessageWarnLevel.INFO,
      true
    );

    setTimeout(async () => {
      this.removeAuthSession(user);
    }, 300000);
  }

  /**
   *
   * @param {User} user
   */
  removeAuthSession(user) {
    if (!this.isUserHasASession(user)) return;
    this.sessions.delete(user.id);
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {User} user
   * @param {String} code
   */
  async checkAuthCode(interaction, user, code) {
    this.playerProfiles = await this.getPlayerProfiles();
    if (this.isUserHasASession(user)) {
      const session = this.getSession(user);
      if (session.authCode != code) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Sai mã xác minh !`,
          MessageWarnLevel.ERROR,
          true
        );
        return;
      }

      this.removeAuthSession(user);
      await this.addDiscordId(session.playerUUID, user.id);

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `***Xác minh hoàn tất, chào mừng bạn đến với server minecraft !***`,
        MessageWarnLevel.SUCCESS,
        true
      );
    } else {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Bạn không có phiên xác minh nào đang hiện hoạt !`,
        MessageWarnLevel.INFO,
        true
      );
    }
  }

  /**
   *
   * @param {String} playerUUID
   * @param {String} discordUserId
   */
  async addDiscordId(playerUUID, discordUserId) {
    await connector.executeQuery(`UPDATE minecraft_db.player_profiles SET discord_id = ? WHERE uuid = ?`, [
      discordUserId,
      playerUUID,
    ]);
  }
}

module.exports = {
  AuthSessionManager,
};
