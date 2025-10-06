const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to check (leave empty for yourself)')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    
    const { data: balance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('guild_id', guildId)
      .eq('user_id', targetUser.id)
      .single();
    
    const amount = balance?.balance || 0;
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle(`💰 Balance for ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${amount}** coins`)
      .setTimestamp();
    
    if (targetUser.id === interaction.user.id) {
      embed.setFooter({ text: 'Use /daily to claim your daily reward!' });
    }
    
    await interaction.reply({ embeds: [embed] });
  },
};
