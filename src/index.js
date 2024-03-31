require(`dotenv`).config();
const { TOKEN } = process.env;
const { Client, Collection, GatewayIntentBits, REST, ActivityType } = require("discord.js");
const fs = require("fs");
const logger = require("./utils/logger");
const { AuthSessionManager } = require("./functions/discordAuth/session/sessionManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

logger.log.server(`Start up...`);
logger.log.server(`Creating caches...`);

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
client.guildIdList = [`1084323144870940772`, `811939594882777128`];
client.rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.commandPaths = new Collection();

for (const folder of fs.readdirSync("./src/functions")) {
  const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter((file) => file.endsWith(`.js`));

  for (const file of functionFiles) {
    logger.log.server(`readinng path: ./functions/${folder}/${file}`);
    require(`./functions/${folder}/${file}`);
  }
}

for (const handlerPath of fs.readdirSync(`./src/handlers`)) {
  require(`./handlers/${handlerPath}`)(client);
}

client.authSessionManager = new AuthSessionManager();
(async ()=>{await client.authSessionManager.syncPlayerProfiles();})()

client.handleEvents();
client.handleCommands();
client.handleComponents();

client.login(TOKEN);
