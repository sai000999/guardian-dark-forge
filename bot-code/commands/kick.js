const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ I cannot kick this user. They may have higher permissions.', ephemeral: true });
    }

    try {
      // Kick the user
      await member.kick(reason);

      // Log to database
      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: targetUser.id,
        moderator_id: interaction.user.id,
        action_type: 'kick',
        reason: reason,
        severity: 'moderate'
      });

      // Send confirmation embed
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('👢 User Kicked')
        .setDescription(`${targetUser.tag} has been kicked from the server.`)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error kicking user:', error);
      await interaction.reply({ content: '❌ Failed to kick user.', ephemeral: true });
    }
  },
};
