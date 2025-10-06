const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Temporarily mute a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 10m, 2h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ I cannot timeout this user. They may have higher permissions.', ephemeral: true });
    }

    // Parse duration
    const match = durationStr.match(/^(\d+)([mhd])$/);
    if (!match) {
      return interaction.reply({ content: '❌ Invalid duration format. Use format like: 10m, 2h, or 1d', ephemeral: true });
    }

    const amount = parseInt(match[1]);
    const unit = match[2];
    let durationMs;
    let durationMinutes;

    switch (unit) {
      case 'm':
        durationMs = amount * 60 * 1000;
        durationMinutes = amount;
        break;
      case 'h':
        durationMs = amount * 60 * 60 * 1000;
        durationMinutes = amount * 60;
        break;
      case 'd':
        durationMs = amount * 24 * 60 * 60 * 1000;
        durationMinutes = amount * 24 * 60;
        break;
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: '❌ Maximum timeout duration is 28 days.', ephemeral: true });
    }

    try {
      // Apply timeout
      await member.timeout(durationMs, reason);

      // Log to database
      await supabase.from('moderation_logs').insert({
        guild_id: interaction.guildId,
        user_id: targetUser.id,
        moderator_id: interaction.user.id,
        action_type: 'timeout',
        reason: reason,
        severity: 'moderate',
        duration_minutes: durationMinutes
      });

      // Send confirmation embed
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('⏰ User Timed Out')
        .setDescription(`${targetUser.tag} has been timed out.`)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error timing out user:', error);
      await interaction.reply({ content: '❌ Failed to timeout user.', ephemeral: true });
    }
  },
};
