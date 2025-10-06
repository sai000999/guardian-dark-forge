const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the economy shop'),
  
  async execute(interaction, client) {
    // This is a placeholder shop - customize with your own items!
    const shopItems = [
      { name: '🎨 Custom Role Color', price: 1000, description: 'Get a custom colored role' },
      { name: '📝 Custom Role Name', price: 1500, description: 'Create your own role name' },
      { name: '⭐ VIP Role', price: 5000, description: 'Get access to VIP channels' },
      { name: '🎭 Profile Badge', price: 500, description: 'Display a special badge' },
      { name: '🔊 Voice Channel Priority', price: 2000, description: 'Priority in voice channels' },
    ];
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('🏪 Economy Shop')
      .setDescription('Purchase items with your coins!\n\n*Items coming soon - shop under construction*')
      .setTimestamp();
    
    shopItems.forEach((item, index) => {
      embed.addFields({
        name: `${index + 1}. ${item.name}`,
        value: `💰 **${item.price}** coins\n${item.description}`,
        inline: false
      });
    });
    
    embed.setFooter({ text: 'Use your coins to buy items • More items coming soon!' });
    
    await interaction.reply({ embeds: [embed] });
  },
};
