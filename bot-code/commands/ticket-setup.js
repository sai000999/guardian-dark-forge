const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Setup the ticket system')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel where ticket panel will be sent')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('staff-role')
        .setDescription('Role that can handle tickets')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    const staffRole = interaction.options.getRole('staff-role');
    
    // Save configuration to database
    await supabase.from('ticket_config').upsert({
      guild_id: guildId,
      ticket_channel_id: channel.id,
      staff_role_id: staffRole.id,
    });
    
    // Create ticket panel embed
    const panelEmbed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('🎫 Auron Support Tickets')
      .setDescription('Need help? Create a support ticket below!\n\n**How it works:**\n• Click 🎫 Create Ticket to open a private support thread\n• Our staff team will assist you shortly\n• Your ticket will remain private between you and staff')
      .setFooter({ text: 'Auron Bot • Professional Support System' })
      .setTimestamp();
    
    const panelButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Create Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('support_info')
          .setLabel('Support Info')
          .setEmoji('🧾')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await channel.send({ embeds: [panelEmbed], components: [panelButtons] });
    
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('✅ Ticket System Configured')
      .setDescription(`**Ticket Panel:** ${channel}\n**Staff Role:** ${staffRole}`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  },
};
