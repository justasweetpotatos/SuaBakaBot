const { readdirSync } = require("fs");
const logger = require("../../utils/logger");

module.exports = (client) => {
  client.handleComponents = async () => {
    const typeOfComponentNameList = readdirSync("./src/components");
    for (const typeOfComponentName of typeOfComponentNameList) {
      const listPackName = readdirSync(`./src/components/${typeOfComponentName}`);
      for (const packName of listPackName) {
        const listFileName = readdirSync(`./src/components/${typeOfComponentName}/${packName}`);
        switch (typeOfComponentName) {
          case "buttons":
            for (const file of listFileName) {
              const button = require(`../../components/${typeOfComponentName}/${packName}/${file}`);
              client.buttons.set(button.data.customId, button);
              logger.log.component(`Button "${button.data.label}" has passed handler !`);
            }
            break;
          case "selectMenus":
            for (const file of listFileName) {
              const menu = require(`../../components/${typeOfComponentName}/${packName}/${file}`);
              client.selectMenus.set(menu.data.customId, menu);
              logger.log.component(`Menu "${menu.data.customId}" has passed handler !`);
            }
            break;
          default:
            break;
        }
      }
    }
  };
};
