const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('📚 Auron Bot Commands')
      .setDescription('Here are all available commands:')
      .addFields(
        { name: '/help', value: 'Show this help message', inline: true },
        { name: '/blacklist', value: 'Manage blacklisted words', inline: true },
        { name: '/ticket', value: 'Create or close support tickets', inline: true },
        { name: '/quarantine', value: 'Quarantine users', inline: true },
        { name: '/level', value: 'Check your level and XP', inline: true },
        { name: '/balance', value: 'Check your balance', inline: true },
        { name: '/daily', value: 'Claim daily reward', inline: true },
        { name: '/give', value: 'Transfer coins to another user', inline: true },
        { name: '/shop', value: 'View the economy shop', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Auron Bot • Made with ❤️' });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
