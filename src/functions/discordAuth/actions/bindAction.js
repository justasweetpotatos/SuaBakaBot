const { CommandInteraction, ButtonInteraction } = require("discord.js");
const { MessageWarnLevel, sendNotificationEmbedMessage } = require("../../../utils/message");
const { PlayerRepository } = require("../playerRepository");

module.exports = {
  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   * @param {String} verifyCode
   */
  async bindAction(interaction, verifyCode) {
    const authSessionManager = interaction.client.authSessionManager;
    await authSessionManager.syncPlayerProfiles();
    if (authSessionManager.isUserHasASession(user)) {
      const session = authSessionManager.getSession(user);
      if (session.authCode != verifyCode) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Sai mã xác minh !`,
          MessageWarnLevel.ERROR,
          true
        );
        return;
      }

      authSessionManager.removeSession(user);
      const playerRepository = new PlayerRepository();
      await playerRepository.updateProfile(session.playerProfile);
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
  },
};
