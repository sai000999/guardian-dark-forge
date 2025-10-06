const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vc-moveall')
    .setDescription('Move all users from one voice channel to another')
    .addChannelOption(option =>
      option.setName('source_channel')
        .setDescription('The source voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('destination_channel')
        .setDescription('The destination voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  
  async execute(interaction, client) {
    const sourceChannel = interaction.options.getChannel('source_channel');
    const destinationChannel = interaction.options.getChannel('destination_channel');

    if (sourceChannel.id === destinationChannel.id) {
      return interaction.reply({ content: '❌ Source and destination channels must be different.', ephemeral: true });
    }

    const members = sourceChannel.members;

    if (members.size === 0) {
      return interaction.reply({ content: '❌ No users found in the source channel.', ephemeral: true });
    }

    try {
      let movedCount = 0;
      for (const [memberId, member] of members) {
        await member.voice.setChannel(destinationChannel);
        movedCount++;
      }

      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🔊 Users Moved')
        .setDescription(`Moved ${movedCount} user(s) from ${sourceChannel.name} to ${destinationChannel.name}.`)
        .addFields(
          { name: 'Source', value: sourceChannel.name, inline: true },
          { name: 'Destination', value: destinationChannel.name, inline: true },
          { name: 'Users Moved', value: movedCount.toString(), inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot Moderation' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error moving users:', error);
      await interaction.reply({ content: '❌ Failed to move users.', ephemeral: true });
    }
  },
};
