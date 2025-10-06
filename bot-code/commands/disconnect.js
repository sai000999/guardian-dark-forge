const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect a user from a voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to disconnect')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (!member.voice.channel) {
      return interaction.reply({ content: '❌ User is not in a voice channel.', ephemeral: true });
    }

    try {
      await member.voice.disconnect();

      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🔇 User Disconnected')
        .setDescription(`${targetUser.tag} has been disconnected from voice.`)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error disconnecting user:', error);
      await interaction.reply({ content: '❌ Failed to disconnect user.', ephemeral: true });
    }
  },
};
