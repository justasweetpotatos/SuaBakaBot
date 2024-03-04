const logger = require("../../utils/logger");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "messageCreate",
  /**
   * @param {Object} param0
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    try {
      if (message.author.bot) return;
      if (message.content.endsWith(`deleted.`)) return;

      const repliedMessage = message.reference?.messageId
        ? await message.channel.messages.fetch(message.reference.messageId)
        : null;

      if (
        message.content.indexOf("call <@866628870123552798>") !== -1
        //|| repliedMessage?.author.id === `866628870123552798`
      ) {
        const mention = `<@${message.author.id}>`;
        const messages = [
          `***Thuê bao quý khách vừa gọi dell cho liên lạc, xin quý khách vui lòng đập cmn máy đi !***`,
          `# *Đọc tên tk mày vừa rep đi !*`,
          // `${mention} suốt ngày ping, lại cho ô cháu một vé ra nhà giàn DK1 giờ !`,
          // <:Uncringe_L:1210949625477996555> ping ping cái qq !
          // `Ping méo gì lắm thế ${mention}, có nịt trả lời ô cháu, thế nhá !`,
          // `Ping cái quần què, có mọe gì ping lắm thế ${mention}`,
          // `Bầu đuổi ! Có gì trình bày nhanh ${mention}`,
          // `Ping ping ping, chỉ biết ping ! Gỏi cho lại bảo tại số !`,
          // `Nói thật với ${mention} là nể ô cháu lắm đấy, chứ ko thì ô cháu pay acc lâu roài !`,
          // `Ping ? Lên phường mà ping <:Suwa_Sleep:891565076551696414>`,
        ];

        let me = await message.reply({ content: messages[randomInt(0, messages.length - 1)] });
        setTimeout(async () => {
          await me.delete();
        }, 10000);
        return;
      } else if (message.content.indexOf(`<@&820631477758197800>`) && false) {
        const mention = `<@${message.author.id}>`;
        const messages = [
          `${mention} suốt ngày ping, lại cho ô cháu một vé ra nhà giàn DK1 giờ !`,
          `Ping méo gì lắm thế ${mention}, có nịt trả lời ô cháu, thế nhá !`,
          `Ping cái quần què, có mọe gì ping lắm thế ${mention}`,
          `Bầu đuổi ! Có gì trình bày nhanh ${mention}`,
          `Ping ping ping, chỉ biết ping ! Gỏi cho lại bảo tại số !`,
        ];

        let me = await message.reply({ content: messages[randomInt(0, messages.length - 1)] });
        setTimeout(async () => {
          await me.delete();
        }, 20000);
        return;
      }
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  },
};
