const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vip-role')
    .setDescription('Configure the VIP role for the shop')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Set the VIP role')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The VIP role to assign')
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
      vip_role_id: role.id,
    });
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('✅ VIP Role Configured')
      .setDescription(`VIP role set to ${role}\n\n**Price:** 5000 coins`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
