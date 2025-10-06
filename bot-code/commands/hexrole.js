const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hexrole')
    .setDescription('Configure the Role Colors Access for the shop')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Set the Role Colors Access role')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The Role Colors role to assign')
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
      hexrole_role_id: role.id,
    });
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('✅ Role Colors Access Configured')
      .setDescription(`Role Colors Access role set to ${role}\n\n**Price:** 2000 coins`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
