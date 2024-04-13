const { Guild, Message, Client, EmbedBuilder, Colors, Collection } = require("discord.js");
const { setTimeout } = require("timers/promises");
const logger = require("../../utils/logger");
const { sendNotificationEmbedMessage, MessageWarnLevel } = require("../../utils/message");

module.exports = class AntiSpamLink {
  /**
   *
   * @param {Client} client
   * @param {Guild} guild
   */
  constructor(client, guild) {
    this.client = client;
    this.guild = guild;
  }

  /**
   *
   * @param {Message} message
   */
  async onMessage(message) {
    const { content, member } = message;

    const bot = message.guild.members.cache.get(this.client.user.id);

    if (message.member.roles.highest.position >= bot.roles.highest.position) return;

    if (content.includes("https://discord.gg/")) {
      if (content.includes("https://discord.gg/5KxmB837QP")) return;
      if (!this.client.blacklistedUsers.get(member.id))
        this.client.blacklistedUsers.set(member.id, {
          level: 0,
          user: member,
        });

      const blacklistedUser = this.client.blacklistedUsers.get(member.id);

      blacklistedUser["level"] += 1;

      message.deletable ? await message.delete() : "";

      setTimeout(() => {
        blacklistedUser["level"] -= 1;
        logger.info(`-1 for ${blacklistedUser}`);
      }, 15000);

      if (blacklistedUser["level"] > 3) {
        member.ban({ reason: "Spam link mời vào server khác không có sự cho phép bởi mod !" });
        blacklistedUser["level"] = 0;
      }

      await sendNotificationEmbedMessage(
        undefined,
        message.channel,
        `*Hành động gửi link invite từ server khác khi không có sự cho phép của mod không được chấp thuận ở đây !*
        *Đây là cảnh cáo lần thứ: **${blacklistedUser["level"]}***`,
        MessageWarnLevel.WARNING,
        false,
        true
      );

      this.client.blacklistedUsers.set(member.id, blacklistedUser);
    }
  }
};
