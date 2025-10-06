const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quarantine')
    .setDescription('Quarantine management')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a user to quarantine')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User to quarantine')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('duration')
            .setDescription('Duration in minutes')
            .setRequired(false)
            .setMinValue(1)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for quarantine')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user from quarantine')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User to remove from quarantine')
            .setRequired(true)
        )
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
    }
    
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;
    const member = await interaction.guild.members.fetch(user.id);
    
    if (subcommand === 'add') {
      const duration = interaction.options.getInteger('duration') || 30;
      const reason = interaction.options.getString('reason') || 'No reason provided';
      
      // Find or create quarantine role
      let role = interaction.guild.roles.cache.find(r => r.name === 'Quarantine');
      
      if (!role) {
        role = await interaction.guild.roles.create({
          name: 'Quarantine',
          color: 0x000000,
          permissions: [],
          reason: 'Quarantine role for moderation',
        });
        
        // Remove view permissions from all channels
        interaction.guild.channels.cache.forEach(async (channel) => {
          await channel.permissionOverwrites.create(role, {
            ViewChannel: false,
            SendMessages: false,
          }).catch(console.error);
        });
      }
      
      await member.roles.add(role);
      
      // Log to database
      await supabase.from('quarantine_logs').insert({
        guild_id: guildId,
        user_id: user.id,
        moderator_id: interaction.user.id,
        duration_minutes: duration,
        reason: reason,
        status: 'active',
      });
      
      await supabase.from('moderation_logs').insert({
        guild_id: guildId,
        user_id: user.id,
        moderator_id: interaction.user.id,
        action_type: 'quarantine',
        reason: reason,
        severity: 'high',
        duration_minutes: duration,
      });
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🔒 User Quarantined')
        .setDescription(`${user} has been quarantined`)
        .addFields(
          { name: 'Duration', value: `${duration} minutes`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(async () => {
          try {
            await member.roles.remove(role);
            await supabase
              .from('quarantine_logs')
              .update({ status: 'removed', removed_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('guild_id', guildId)
              .eq('status', 'active');
          } catch (error) {
            console.error('Error auto-removing quarantine:', error);
          }
        }, duration * 60 * 1000);
      }
      
    } else if (subcommand === 'remove') {
      const role = interaction.guild.roles.cache.find(r => r.name === 'Quarantine');
      
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        
        await supabase
          .from('quarantine_logs')
          .update({ status: 'removed', removed_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('guild_id', guildId)
          .eq('status', 'active');
        
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🔓 Quarantine Removed')
          .setDescription(`${user} has been removed from quarantine`)
          .addFields({ name: 'Moderator', value: interaction.user.tag })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({ content: '❌ User is not in quarantine!', ephemeral: true });
      }
    }
  },
};
