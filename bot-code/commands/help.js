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
        { name: '🛡️ Moderation', value: '\u200b', inline: false },
        { name: '/kick', value: 'Kick a user from the server', inline: true },
        { name: '/ban', value: 'Ban a user from the server', inline: true },
        { name: '/timeout', value: 'Temporarily mute a user', inline: true },
        { name: '/quarantine', value: 'Quarantine users', inline: true },
        { name: '/blacklist', value: 'Manage blacklisted words', inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: '🎤 Voice', value: '\u200b', inline: false },
        { name: '/disconnect', value: 'Disconnect a user from VC', inline: true },
        { name: '/vc-move', value: 'Move a user to specific VC', inline: true },
        { name: '/vc-moveall', value: 'Move all users between VCs', inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: '🎮 Utility', value: '\u200b', inline: false },
        { name: '/help', value: 'Show this help message', inline: true },
        { name: '/ticket', value: 'Create or close support tickets', inline: true },
        { name: '/afk', value: 'Set yourself as AFK', inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: '⭐ Leveling & Economy', value: '\u200b', inline: false },
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
