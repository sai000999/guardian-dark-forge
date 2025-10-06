const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Transfer coins to another user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to give coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of coins to give')
        .setRequired(true)
        .setMinValue(1)
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const sender = interaction.user;
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    // Check if trying to give to self
    if (sender.id === recipient.id) {
      return interaction.reply({ content: '❌ You cannot give coins to yourself!', ephemeral: true });
    }
    
    // Check if recipient is a bot
    if (recipient.bot) {
      return interaction.reply({ content: '❌ You cannot give coins to bots!', ephemeral: true });
    }
    
    // Get sender balance
    const { data: senderBalance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('guild_id', guildId)
      .eq('user_id', sender.id)
      .single();
    
    const senderAmount = senderBalance?.balance || 0;
    
    // Check if sender has enough coins
    if (senderAmount < amount) {
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('❌ Insufficient Balance')
        .setDescription(`You don't have enough coins!\n\n**Your balance:** ${senderAmount} coins\n**Needed:** ${amount} coins`)
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Get recipient balance
    const { data: recipientBalance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('guild_id', guildId)
      .eq('user_id', recipient.id)
      .single();
    
    const recipientAmount = recipientBalance?.balance || 0;
    
    // Update balances
    const newSenderBalance = senderAmount - amount;
    const newRecipientBalance = recipientAmount + amount;
    
    await supabase.from('user_balances').upsert({
      guild_id: guildId,
      user_id: sender.id,
      balance: newSenderBalance,
    });
    
    await supabase.from('user_balances').upsert({
      guild_id: guildId,
      user_id: recipient.id,
      balance: newRecipientBalance,
    });
    
    // Log transactions
    await supabase.from('economy_transactions').insert([
      {
        guild_id: guildId,
        user_id: sender.id,
        amount: -amount,
        transaction_type: 'transfer',
        description: `Sent ${amount} coins to ${recipient.tag}`,
        balance_after: newSenderBalance,
      },
      {
        guild_id: guildId,
        user_id: recipient.id,
        amount: amount,
        transaction_type: 'transfer',
        description: `Received ${amount} coins from ${sender.tag}`,
        balance_after: newRecipientBalance,
      },
    ]);
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Transfer Successful')
      .setDescription(`You gave **${amount} coins** to ${recipient}`)
      .addFields(
        { name: 'Your New Balance', value: `${newSenderBalance} coins`, inline: true },
        { name: `${recipient.username}'s New Balance`, value: `${newRecipientBalance} coins`, inline: true }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
