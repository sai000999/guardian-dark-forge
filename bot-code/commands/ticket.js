const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new support ticket')
        .addStringOption(option =>
          option
            .setName('subject')
            .setDescription('What is your ticket about?')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close the current ticket')
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'create') {
      const subject = interaction.options.getString('subject') || 'Support Request';
      
      // Check if user already has an open ticket
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('*')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .eq('status', 'open')
        .single();
      
      if (existingTicket) {
        return interaction.reply({ 
          content: '❌ You already have an open ticket! Please close it before creating a new one.', 
          ephemeral: true 
        });
      }
      
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Create ticket channel
        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: userId,
              allow: [
                PermissionFlagsBits.ViewChannel, 
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel, 
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ManageChannels
              ],
            },
          ],
        });
        
        // Save to database
        await supabase.from('tickets').insert({
          guild_id: guildId,
          user_id: userId,
          channel_id: channel.id,
          status: 'open',
          subject: subject,
        });
        
        // Send welcome message in ticket
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0xDC2626)
          .setTitle('🎫 Support Ticket Created')
          .setDescription(`Welcome ${interaction.user}!\n\n**Subject:** ${subject}\n\nPlease describe your issue and a staff member will assist you shortly.`)
          .addFields({ name: 'Close Ticket', value: 'Use `/ticket close` when your issue is resolved' })
          .setTimestamp();
        
        await channel.send({ embeds: [welcomeEmbed] });
        
        // Reply to user
        const embed = new EmbedBuilder()
          .setColor(0xDC2626)
          .setTitle('✅ Ticket Created')
          .setDescription(`Your ticket has been created in ${channel}`)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
      } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({ 
          content: '❌ Failed to create ticket. Please contact an administrator.', 
        });
      }
      
    } else if (subcommand === 'close') {
      const channelName = interaction.channel.name;
      
      if (!channelName.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
      }
      
      // Update database
      await supabase
        .from('tickets')
        .update({ 
          status: 'closed', 
          closed_at: new Date().toISOString(), 
          closed_by: userId 
        })
        .eq('channel_id', interaction.channel.id);
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🎫 Ticket Closed')
        .setDescription('This ticket has been closed. The channel will be deleted in 5 seconds.')
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }
  },
};
