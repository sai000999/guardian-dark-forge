const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vcaccess-role')
    .setDescription('Configure the Private VC Access role for the shop')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Set the Private VC Access role')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The Private VC role to assign')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const role = interaction.options.getRole('role');
    
    await supabase.from('shop_config').upsert({
      guild_id: guildId,
      vcaccess_role_id: role.id,
    });
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('✅ Private VC Access Role Configured')
      .setDescription(`Private VC Access role set to ${role}\n\n**Price:** 8000 coins`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
