const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monitor-stop')
    .setDescription('Stop monitoring a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to stop monitoring')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    try {
      // Delete monitored channel
      const { error } = await supabase
        .from('monitored_channels')
        .delete()
        .eq('guild_id', guildId)
        .eq('channel_id', channel.id);

      if (error) {
        console.error('❌ Error removing monitored channel:', error);
        return interaction.reply({ content: '❌ Failed to stop monitoring.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🧠 Auron Monitor System')
        .setDescription(`💤 Stopped monitoring ${channel}.`)
        .setColor('#111111')
        .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
        .setTimestamp();

      console.log(`💤 Stopped monitoring #${channel.name} in ${interaction.guild.name}`);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Monitor-stop command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  },
};
