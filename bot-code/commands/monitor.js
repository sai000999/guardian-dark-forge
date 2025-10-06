const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monitor')
    .setDescription('Start monitoring a channel for inactivity')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to monitor')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    if (!channel.isTextBased()) {
      return interaction.reply({ content: '⛔ Please select a text channel.', ephemeral: true });
    }

    try {
      // Upsert monitored channel
      const { error } = await supabase
        .from('monitored_channels')
        .upsert({
          guild_id: guildId,
          channel_id: channel.id,
          last_active: new Date().toISOString(),
          active: true
        }, {
          onConflict: 'guild_id,channel_id'
        });

      if (error) {
        console.error('❌ Error adding monitored channel:', error);
        return interaction.reply({ content: '❌ Failed to start monitoring.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🧠 Auron Monitor System')
        .setDescription(`✅ Now monitoring ${channel}.\nI'll send a random question if this chat stays silent for 15 minutes.`)
        .setColor('#111111')
        .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
        .setTimestamp();

      console.log(`✅ Started monitoring #${channel.name} in ${interaction.guild.name}`);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Monitor command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  },
};
