const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();
    
    const now = new Date();
    const lastDaily = balance?.last_daily ? new Date(balance.last_daily) : null;
    
    // Check if user already claimed today
    if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
      const timeLeft = 24 * 60 * 60 * 1000 - (now - lastDaily);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('⏰ Daily Already Claimed')
        .setDescription(`You already claimed your daily reward!\n\n**Come back in:** ${hoursLeft}h ${minutesLeft}m`)
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    const reward = 100;
    const newBalance = (balance?.balance || 0) + reward;
    
    // Update balance
    await supabase.from('user_balances').upsert({
      guild_id: guildId,
      user_id: userId,
      balance: newBalance,
      last_daily: now.toISOString(),
    });
    
    // Log transaction
    await supabase.from('economy_transactions').insert({
      guild_id: guildId,
      user_id: userId,
      amount: reward,
      transaction_type: 'daily',
      description: 'Daily reward claimed',
      balance_after: newBalance,
    });
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Daily Reward Claimed!')
      .setDescription(`You received **${reward} coins**!`)
      .addFields(
        { name: 'New Balance', value: `**${newBalance}** coins`, inline: true },
        { name: 'Come back in', value: '24 hours', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Daily rewards help you earn coins!' });
    
    await interaction.reply({ embeds: [embed] });
  },
};
