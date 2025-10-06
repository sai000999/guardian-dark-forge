const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vc-move')
    .setDescription('Move a user to a specific voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to move')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The voice channel to move to')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const targetChannel = interaction.options.getChannel('channel');
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (!member.voice.channel) {
      return interaction.reply({ content: '❌ User is not in a voice channel.', ephemeral: true });
    }

    try {
      await member.voice.setChannel(targetChannel);

      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🔊 User Moved')
        .setDescription(`${targetUser.tag} has been moved to ${targetChannel.name}.`)
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Channel', value: targetChannel.name, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error moving user:', error);
      await interaction.reply({ content: '❌ Failed to move user.', ephemeral: true });
    }
  },
};
