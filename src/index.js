require("dotenv").config();
const { TOKEN, DATABASE_TOKEN } = process.env;
const { Client, Collection, GatewayIntentBits, REST } = require("discord.js");
const fs = require("fs");
const { getNoichuGuildData } = require("./database/guildNoichuData");
const logger = require("./utils/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

logger.log.server(`Start up...`);
logger.log.server(`Create caches...`);

client.commands = new Collection();
client.subcommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.commandJSONArray = [];
client.subcommandJSONArray = [];
client.unloadedCommands = new Collection();
client.unloadedSubcommands = new Collection();
client.commandNameList = [];

client.clientId = "1168430797599019022";
client.guildIdList = [`811939594882777128`, `1084323144870940772`];
client.rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  client.noichuGuildDataList = await getNoichuGuildData();
})();

client.commandPaths = new Collection();

for (const folder of fs.readdirSync("./src/functions")) {
  const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter((file) => file.endsWith(`.js`));

  for (const file of functionFiles) {
    if (file.includes(`noichu`)) require(`./functions/${folder}/${file}`);
    else require(`./functions/${folder}/${file}`)(client);
  }
}
logger.log.server(`All caches created !`);

logger.log.server(`Handling progress...`);
client.handleEvents();
client.handleCommands();
client.handleComponents();

client.login(TOKEN);
