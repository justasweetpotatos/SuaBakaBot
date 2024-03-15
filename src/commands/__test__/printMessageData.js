const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  SlashCommandNumberOption,
  Interaction,
  Client,
} = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName(`message-data`).setDescription(`any`),
  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const message = await interaction.channel.messages.fetch(`1217317178236469308`);

    // // Prepare to insert message embed
    // const embeds = message.embeds;
    // if (embeds.length !== 0) console.log(embeds[0].toJSON());

    // Prepare to insert message attachment
    const attachments = message.attachments;
    if (attachments.size !== 0) {
      for (const attachment of attachments) {
        try {
          const id = attachment[0];
          const attachmentData = attachment[1];
          const attachmentURL = attachmentData.url;

          // Prepare for download attachment
          const response = await axios.get(attachmentURL, { responseType: "arraybuffer" });

          const writeZonePath = "D:\\attachments_DB";

          const { fileTypeName, fileName } = (() => {
            const arrayOfString = path.basename(attachmentURL).split("?")[0].split(".");
            const fileTypeName = arrayOfString[arrayOfString.length - 1];
            const fileName = path.basename(attachmentURL).split("?")[0].replace(fileTypeName, "");
            return { fileTypeName: fileTypeName, fileName: fileName };
          })();

          const fullFileName = `${id}.${fileName}${fileTypeName}`;

          const filePath = path.join(writeZonePath, fullFileName);

          fs.writeFile(filePath, response.data, (err) => {
            if (err) {
              logger.errors.server(`Lỗi khi ghi tệp đính kèm: ${err}`);
              console.error(err);
            } else {
              console.log(`Đã ghi tệp đính kèm thành công vào: ${filePath}`);
            }
          });
        } catch (error) {
          logger.errors.server(`${error}`);
          console.log(error);
        }
      }
    }

    await interaction.editReply({ content: `done` });
  },
};
