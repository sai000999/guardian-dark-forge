const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself as AFK')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for being AFK')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'AFK';

    try {
      // Insert or update AFK status
      await supabase.from('afk_status').upsert({
        user_id: interaction.user.id,
        guild_id: interaction.guildId,
        reason: reason,
        set_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,guild_id'
      });

      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('💤 AFK Status Set')
        .setDescription(`${interaction.user.tag} is now AFK`)
        .addFields(
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Auron Bot' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error setting AFK status:', error);
      await interaction.reply({ content: '❌ Failed to set AFK status.', ephemeral: true });
    }
  },
};
