const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for banning')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this user. They may have higher permissions.', ephemeral: true });
    }

    try {
      // Ban the user
      await interaction.guild.members.ban(targetUser.id, { reason });

      // Log to database
      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: targetUser.id,
        moderator_id: interaction.user.id,
        action_type: 'ban',
        reason: reason,
        severity: 'high'
      });

      // Send confirmation embed
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🔨 User Banned')
        .setDescription(`${targetUser.tag} has been banned from the server.`)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply({ content: '❌ Failed to ban user.', ephemeral: true });
    }
  },
};
