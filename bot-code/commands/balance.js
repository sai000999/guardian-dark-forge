const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your coin balance')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', targetUser.id)
      .maybeSingle();
    
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('💰 Auron Coin Balance')
      .setDescription(`**${targetUser.username}**\n\n🪙 **${balance?.balance || 0}** coins`)
      .addFields(
        { name: '📊 Earning Rate', value: '• 5 coins per 10 messages\n• 100 coins per 10 minutes in voice', inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: 'Auron Economy System' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
