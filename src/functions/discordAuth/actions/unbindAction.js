const { sendNotificationEmbedMessage, MessageWarnLevel } = require("../../../utils/message");
const { PlayerRepository } = require("../playerRepository");

module.exports = {
  async unbindAction(interaction) {
    const authSessionManager = interaction.client.authSessionManager;
    const user = interaction.user;
    if (authSessionManager.isLinkedDiscordAccount(user)) {
      const playerProfile = authSessionManager.getPlayerProfile(user);
      if (!playerProfile) throw new Error(`GET_PLAYER_PROFILE_ERROR_FROM_MANAGER: Profile is empty !`);

      playerProfile.discordId = "";
      new PlayerRepository().updateProfile(playerProfile);

      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Đã unbind tài khoản với tài khoản minecraft ${playerProfile.name}`,
        MessageWarnLevel.SUCCESS,
        true
      );
    } else {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `Bạn chưa liên kết discord với tài khoản minecraft nào !`,
        MessageWarnLevel.INFO,
        true
      );
    }
  },
};
