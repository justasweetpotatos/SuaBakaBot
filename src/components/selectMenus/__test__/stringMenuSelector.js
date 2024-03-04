module.exports = {
  data: {
    customId: `menu-test`,
    placeholder: `any`,
    options: [
      {
        label: "item 1",
        description: "item 1",
        value: "cat",
      },
      {
        label: "item 2",
        description: "item 2",
        value: "dog",
      },
      {
        label: "item 3",
        description: "item 3",
        value: "bird",
      },
    ],
  },
  async execute(interaction, client, execute) {
    console.log(interaction.values);
  },
};
