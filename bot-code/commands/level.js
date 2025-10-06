const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your level and XP')
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
    
    const { data: userLevel } = await supabase
      .from('user_levels')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', targetUser.id)
      .single();
    
    if (!userLevel) {
      return interaction.reply({ 
        content: `❌ ${targetUser === interaction.user ? 'You have' : targetUser.tag + ' has'} no level data yet. Start chatting to gain XP!`, 
        ephemeral: true 
      });
    }
    
    const xpNeeded = userLevel.level * 100;
    const progress = Math.round((userLevel.xp / xpNeeded) * 100);
    
    // Calculate rank
    const { data: allUsers } = await supabase
      .from('user_levels')
      .select('user_id, level, xp')
      .eq('guild_id', guildId)
      .order('level', { ascending: false })
      .order('xp', { ascending: false });
    
    const rank = allUsers?.findIndex(u => u.user_id === targetUser.id) + 1 || '?';
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle(`📊 Level Stats for ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Level', value: `**${userLevel.level}**`, inline: true },
        { name: 'Rank', value: `**#${rank}**`, inline: true },
        { name: 'Messages', value: `**${userLevel.total_messages}**`, inline: true },
        { name: 'Current XP', value: `${userLevel.xp}/${xpNeeded}`, inline: true },
        { name: 'Progress', value: `${progress}%`, inline: true },
        { name: 'Next Level', value: `${xpNeeded - userLevel.xp} XP needed`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Keep chatting to level up!' });
    
    await interaction.reply({ embeds: [embed] });
  },
};
