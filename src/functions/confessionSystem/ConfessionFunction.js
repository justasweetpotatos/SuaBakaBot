const logger = require("../../utils/logger");
const { connector } = require(`../../database/connection`);
const {
  CommandInteraction,
  ForumChannel,
  ButtonInteraction,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ActionRow,
  ModalSubmitInteraction,
  Message,
} = require("discord.js");
const { autoBuildButton } = require("../../utils/autoBuild");

class ConfessionPost {
  /**
   *
   * @param {String} id
   * @param {String} authorId
   * @param {String} channelId
   * @param {String} guildId
   * @param {String} name
   * @param {String} content
   * @param {Boolean} anonymous
   * @param {Boolean} locked
   */
  constructor(id, authorId, channelId, guildId, name, content, anonymous, locked) {
    // User data
    this.id = id;
    this.authorId = authorId ? authorId : "";
    this.channelId = channelId ? channelId : "";
    this.guildId = guildId ? guildId : "";

    // Post data
    this.name = name ? name : "";
    this.content = content ? content : "";
    this.anonymous = anonymous ? anonymous : false;
    this.locked = locked ? locked : false;
    this.sync = false;
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async update() {
    try {
      const tableName = `guild_${this.guildId}`;
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
        -1,
        this.locked && this.locked == true ? 1 : -1,
        this.anonymous && this.anonymous == true ? 1 : -1,
      ];
      await connector.executeQuery(query, values);
      return true;
    } catch (error) {
      logger.errors.database(
        `Error on updating data of post ${this.id} in channel ${this.channelId}: ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async reSync() {
    try {
      const query = `SELECT * FROM guild_${this.guildId}.confession_posts WHERE id = '${this.id}'`;

      const resutls = await connector.executeQuery(query);

      if (resutls.size == 0) return false;

      this.authorId = resutls[0].author_id;
      this.channelId = resutls[0].channel_id;
      this.guildId = resutls[0].guild_id;
      this.name = resutls[0].name;
      this.content = resutls[0].content;
      this.locked = resutls[0].locked === 1 ? true : false;
      this.anonymous = resutls[0].anonymous === 1 ? true : false;
      return true;
    } catch (error) {
      logger.errors.database(`Error on syncing data of post with id ${this.id}: ${error}`);
      return false;
    }
  }

  /**
   *
   * @param {String} guildId
   * @returns {Promise<Boolean>}
   */
  async delete() {
    try {
      const tableName = `guild_${this.guildId}`;
      const query = `
        DELETE FROM ${tableName}.confession_posts WHERE id = '${this.id}';
      `;

      await connector.executeQuery(query);
      return true;
    } catch (error) {
      logger.errors.database(
        `Error on deleting data of post ${this.id} in channel ${this.channelId}: ${error}`
      );
      return false;
    }
  }

  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @returns {{postEmbed: Embed, actionRow: ActionRow}}
   */
  getPostInterfaceData(interaction) {
    // Create post embed
    const postEmbed = new EmbedBuilder()
      .setTitle(`Tiêu đề: ${this.name}`)
      .setDescription(`**"${this.content}"**`)
      .setColor(this.anonymous ? Colors.Blurple : Colors.Green);
    postEmbed.setTimestamp(new Date().getTime());
    this.anonymous
      ? postEmbed.setFooter({ text: `Ẩn danh` })
      : postEmbed.setFooter({
          text: `${interaction.user.displayName}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

    // Create post buttons
    const reportButton = autoBuildButton(interaction.client.buttons.get(`confession-post-report-btn`).data);
    const editButton = autoBuildButton(interaction.client.buttons.get(`confession-post-edit-btn`).data);
    const deleteButton = autoBuildButton(interaction.client.buttons.get(`confession-post-delete-btn`).data);

    const actionRow = new ActionRowBuilder().addComponents([reportButton, deleteButton, editButton]);

    return { postEmbed: postEmbed, actionRow: actionRow };
  }
}

class ConfessionGuildManager {}

class ConfesisonPostChannelManager {
  /**
   *
   * @param {String} id
   * @param {String} channelId
   */
  constructor(id, guildId) {
    this.id = id;
    this.guildId = guildId;
    this.countOfConfessionPost = 1;
    this.tagIdList = [];
  }

  /**
   * @returns {Promis<Boolean>}
   */
  async update() {
    try {
      const query = `
        INSERT INTO guild_${this.guildId}.confession_channels
        (id, guild_id, tag_id_list, count_of_confession_post)
        VALUES(?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        tag_id_list = VALUES(tag_id_list),
        \`name\` = VALUES(name),
        count_of_confession_post = VALUES(count_of_confession_post);
      `;
      const values = [this.id, this.guildId, this.tagIdList.join(" "), this.countOfConfessionPost];
      await connector.executeQuery(query, values);
      return true;
    } catch (error) {
      logger.errors.database(`Error on updating data of confession channel with id ${this.id}: ${error}`);
      return false;
    }
  }

  async sync() {
    try {
      const query = `SELECT * FROM guild_${this.guildId}.confession_channels WHERE id = ?`;
      const values = [this.id];
      const results = await connector.executeQuery(query, values);
      if (!results[0] === 0)
        throw new Error(`Can't not syncing data from db: This data of this channel is not exist !`);

      const data = results[0];
      this.tagIdList = data.tag_id_list?.split(" ");
      this.countOfConfessionPost = data.count_of_confession_post;
      return true;
    } catch (error) {
      logger.errors.database(`Error on syncing data of guild with id: ${this.guildId}`);
    }
  }

  /**
   *
   * @param {CommandInteraction | ButtonInteraction} interaction
   */
  async createPostGeneratorView_postType(interaction) {
    try {
      const postParentChannel = interaction.guild.channels.cache.get(this.id);
      if (postParentChannel instanceof ForumChannel) {
        const createAnonymousPostBtn = autoBuildButton(
          interaction.client.buttons.get(`confession-create-anonymous-post-btn`).data
        );
        const createPostBtn = autoBuildButton(
          interaction.client.buttons.get(`confession-create-post-btn`).data
        );
        const actionRow = new ActionRowBuilder().addComponents([createPostBtn, createAnonymousPostBtn]);
        const postOfGenerator = postParentChannel.threads.create({
          name: `Confession Generator.`,
          message: {
            content: `Bấm vào để xem chi tiết`,
            embeds: [
              new EmbedBuilder()
                .setTitle(`Confession Generator`)
                .setDescription(
                  `Tạo confession bằng các nút dưới đây:
                  \`Confession\`: Tạo confession hiện tên.
                  \`Anonymous confession\`: tạo confession ẩn danh.`
                )
                .setColor(Colors.Blurple),
            ],
            components: [actionRow],
          },
        });
      }

      const successEmbed = new EmbedBuilder()
        .setTitle(`Thao tác hoàn tất !`)
        .setDescription(`*Đã tạo generator !*`)
        .setColor(Colors.Green);

      interaction.deferred
        ? await interaction.editReply({ embeds: [successEmbed] })
        : await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      logger.errors.command(`Error on executing command ${interaction.commandName}: ${error}`);
    }
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {ConfessionPost} confessionPost
   */
  async createPost(interaction, confessionPost) {
    try {
      const channel = interaction.guild.channels.cache.get(this.id);

      if (channel instanceof ForumChannel) {
        // Checking is confession channel
        if (!(await this.sync())) {
          interaction.deferred
            ? await interaction.editReply({ content: `Not confession channel !` })
            : await interaction.channel.send({ content: `Not Confession channel !` });
          return false;
        }

        // Get tag
        let aTag, nTag;
        channel.availableTags.forEach((tag) => {
          if (tag.name.toLowerCase().includes("confession") && !nTag) nTag = tag;
          if (tag.name.toLowerCase().includes("anonymous confession")) aTag = tag;
        });

        // Create post interface
        const interfaceComponents = confessionPost.getPostInterfaceData(interaction);

        // Create post
        const thread = await channel.threads.create({
          message: {
            content: `**${
              confessionPost.anonymous
                ? `Anonymous Confession #${this.countOfConfessionPost}`
                : `Confession #${this.countOfConfessionPost}`
            }**`,
            embeds: [interfaceComponents.postEmbed],
            components: [interfaceComponents.actionRow],
          },
          name: confessionPost.name ? confessionPost.name : "No Content",
          appliedTags: [confessionPost.anonymous ? aTag.id : nTag.id],
        });

        // Update post id
        confessionPost.id = thread.id;
        // Update index for next post
        this.countOfConfessionPost += 1;

        // Add create Anonymous reply
        const button = autoBuildButton(
          interaction.client.buttons.get(`confession-post-anonymous-reply-btn`).data
        );
        const actionRow = new ActionRowBuilder().addComponents([button]);

        const embed = new EmbedBuilder()
          .setTitle(`Anonymous message generator`)
          .setDescription(`**Tạo trả lời ẩn danh bằng cách bấm vào nút dưới đây:**`);
        await thread.send({ embeds: [embed], components: [actionRow] });

        // Update data to DB
        await this.update();
        await confessionPost.update();
        return true;
      } else return false;
    } catch (error) {
      logger.errors.command(`Error on creating post in channel ${this.channelId}: ${error}`);
      console.log(error);
      return false;
    }
  }

  /**
   * @param {CommandInteraction | ModalSubmitInteraction} interaction
   * @param {Message} postMessage
   * @param {ConfessionPost} confessionPost
   */
  async editAndUpdatePost(interaction, postMessage, confessionPost) {
    try {
      // Get tag
      let aTag, nTag;
      interaction.channel.parent.availableTags.forEach((tag) => {
        if (tag.name.toLowerCase().includes("confession") && !nTag) nTag = tag;
        if (tag.name.toLowerCase().includes("anonymous confession")) aTag = tag;
      });

      await confessionPost.update();
      const { postEmbed, actionRow } = confessionPost.getPostInterfaceData(interaction);
      const postIndex = postMessage.content.match(/\d+/)[0];
      const postContent = `**${
        confessionPost.anonymous ? `Anonymous Confession #${postIndex}` : `Confession #${postIndex}`
      }**`;
      await postMessage.edit({ content: postContent, embeds: [postEmbed], components: [actionRow] });
      await interaction.channel.setAppliedTags([confessionPost.anonymous ? aTag.id : nTag.id]);
    } catch (error) {
      logger.errors.server(`Error on editing post with id ${confessionPost.id}: ${error}`);
    }
  }

  /**
   *
   * @param {String} id Id of post
   * @returns {Promise<ConfessionPost | undefined>}
   */
  async getPost(id) {
    try {
      const post = new ConfessionPost(id);
      if (!(await post.sync()))
        throw new Error(`Can't not get post with id ${id}: Post is not exist on DB !`);
      return post;
    } catch (error) {
      logger.errors.database(`Error on get post from db with id ${id}: ${error}`);
      return undefined;
    }
  }
}

module.exports = { ConfessionPost, ConfesisonPostChannelManager };
