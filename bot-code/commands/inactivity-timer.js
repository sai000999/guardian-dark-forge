const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inactivity-timer')
    .setDescription('Manage inactivity timer settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the inactivity timer in minutes')
        .addIntegerOption(option =>
          option.setName('minutes')
            .setDescription('Time in minutes (5-120)')
            .setRequired(true)
            .setMinValue(5)
            .setMaxValue(120)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const guildId = interaction.guild.id;

    if (minutes < 5) {
      return interaction.reply({ content: '⛔ Minimum time is 5 minutes.', ephemeral: true });
    }

    if (minutes > 120) {
      return interaction.reply({ content: '⛔ Maximum time is 120 minutes.', ephemeral: true });
    }

    try {
      // Upsert inactivity settings
      const { error } = await supabase
        .from('inactivity_settings')
        .upsert({
          guild_id: guildId,
          timeout_minutes: minutes
        }, {
          onConflict: 'guild_id'
        });

      if (error) {
        console.error('❌ Error updating inactivity timer:', error);
        return interaction.reply({ content: '❌ Failed to update timer.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🕒 Auron Monitor Settings')
        .setDescription(`✅ Inactivity timer updated to **${minutes} minutes** for this server.`)
        .setColor('#111111')
        .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
        .setTimestamp();

      console.log(`✅ Inactivity timer set to ${minutes} minutes for ${interaction.guild.name}`);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Inactivity-timer command error:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  },
};
