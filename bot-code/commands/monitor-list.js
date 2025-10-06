const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monitor-list')
    .setDescription('List all monitored channels'),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const { data: channels, error } = await supabase
        .from('monitored_channels')
        .select('*')
        .eq('guild_id', guildId)
        .eq('active', true);

      if (error) {
        console.error('❌ Error fetching monitored channels:', error);
        return interaction.reply({ content: '❌ Failed to fetch monitored channels.', ephemeral: true });
      }

      if (!channels || channels.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📋 Monitored Channels')
          .setDescription('No channels are currently being monitored.')
          .setColor('#111111')
          .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      let description = '📋 **Monitored Channels:**\n\n';
      
      channels.forEach((ch, index) => {
        const lastActive = new Date(ch.last_active);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastActive) / 60000);
        
        let timeString;
        if (diffMinutes < 60) {
          timeString = `${diffMinutes}m ago`;
        } else {
          const hours = Math.floor(diffMinutes / 60);
          timeString = `${hours}h ago`;
        }

        description += `${index + 1}️⃣ <#${ch.channel_id}> — last active ${timeString}\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('📋 Monitored Channels')
        .setDescription(description)
        .setColor('#111111')
        .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Monitor-list command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  },
};
