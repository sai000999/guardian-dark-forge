const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the Auron coin shop'),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('🛍️ Auron Coin Shop')
      .setDescription('Purchase exclusive perks with your coins!\n\n**Available Items:**')
      .addFields(
        { name: '⭐ VIP Role', value: '**5000 coins** • Get exclusive VIP access', inline: false },
        { name: '🔊 Private VC Access', value: '**8000 coins** • Access to private voice channels', inline: false },
        { name: '🎨 Role Colors Access', value: '**2000 coins** • Unlock custom role colors', inline: false }
      )
      .setFooter({ text: 'Click buttons below to purchase • Auron Economy' })
      .setTimestamp();
    
    const shopButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('buy_vip')
          .setLabel('VIP Role (5000)')
          .setEmoji('⭐')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('buy_vcaccess')
          .setLabel('VC Access (8000)')
          .setEmoji('🔊')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('buy_hexrole')
          .setLabel('Colors (2000)')
          .setEmoji('🎨')
          .setStyle(ButtonStyle.Success)
      );
    
    await interaction.reply({ embeds: [embed], components: [shopButtons] });
  },
};
