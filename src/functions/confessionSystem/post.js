const { ActionRowBuilder } = require("@discordjs/builders");
const { EmbedBuilder, CommandInteraction, ButtonInteraction, Colors } = require("discord.js");
const logger = require("../../utils/logger");
const { connector } = require("../../database/connection");

const PostType = {
  messsage: 2,
  threadOfForumChannel: 1,
};

class ConfessionPost {
  /**
   *
   * @param {String} postType
   * @param {String} authorId
   * @param {String} channelId
   * @param {String} parentId - If post is forum thread channel, this is id of channel containt post;
   * @param {String} guildId
   * @param {String} name
   * @param {String} content
   * @param {Number} index
   * @param {Boolean} anonymous
   * @param {Boolean} locked
   * @param {Boolean} nsfw
   */
  constructor(
    postType,
    authorId,
    channelId,
    parentId,
    guildId,
    name,
    content,
    index,
    anonymous,
    locked,
    nsfw
  ) {
    this.id;
    this.postType = postType ? postType : PostType.messsage;
    this.authorId = authorId ? authorId : "";
    this.channelId = channelId ? channelId : "";
    this.parentId = parentId ? parentId : "";
    this.guildId = guildId ? guildId : "";
    this.name = name ? name : "";
    this.content = content ? content : "";
    this.index = index ? index : 1;
    this.anonymous = anonymous ? anonymous : false;
    this.locked = locked ? locked : false;
    this.nsfw = nsfw ? nsfw : false;
  }

  /**
   * Set id after created post
   * @param {String} id - Id of post
   */
  setPostId(id) {
    this.id = id;
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction - User interaction
   * @returns {{postTitle: String, embed: EmbedBuilder, actionRow: ActionRowBuilder}}
   */
  createPostInterfaceConponets(interaction) {
    const postTitle = this.anonymous ? `Anonymous Confession #${this.index}` : `Confession #${this.index}`;

    const authorName = this.anonymous ? `Ẩn danh` : interaction.user.displayName;
    const authorAvatarUrl = interaction.user.displayAvatarURL();
    const embedColor = this.anonymous ? Colors.Blurple : Colors.Green;
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${authorName}`, iconURL: authorAvatarUrl })
      .setTitle(`Tiêu đề: ${this.name}`)
      .setDescription(`**"${this.content}"**`)
      .setColor(embedColor);

    // Create post buttons
    const reportButton = autoBuildButton(interaction.client.buttons.get(`confession-post-report-btn`).data);
    const editButton = autoBuildButton(interaction.client.buttons.get(`confession-post-edit-btn`).data);
    const deleteButton = autoBuildButton(interaction.client.buttons.get(`confession-post-delete-btn`).data);

    // Create message action row
    const actionRow = new ActionRowBuilder().addComponents([reportButton, deleteButton, editButton]);

    return { postTitle: postTitle, embed: embed, actionRow: actionRow };
  }

  /**
   *
   * @param {String} id - Id of post (Required !)
   */
  async sync(id) {
    try {
      this.id = id;
      const tableName = `guild_${this.guildId}`;
      if (!this.guildId) throw new Error(`Can't execute query, the post guildId is not defined !`);
      const query = `
        INSERT INTO ${tableName}.confession_posts
        (id, author_id, channel_id, guild_id, \`name\`, content, is_nsfw, \`locked\`, anonymous)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        content = VALUES(content),
        anonymous = VALUES(anonymous),
        \`locked\` = VALUES(\`locked\`)
      `;

      const values = [
        this.id,
        this.authorId,
        this.channelId,
        this.guildId,
        this.name,
        this.content,
        this.locked,
        this.anonymous,
      ];

      await connector.executeQuery();
    } catch (error) {
      logger.errors.database(`Error on syncing data of confession post with id ${this.id}: ${error}`);
    }
  }
}
