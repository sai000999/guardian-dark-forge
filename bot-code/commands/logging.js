const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Set up the Auron logging system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if logging is already set up
      const { data: existingConfig } = await supabase
        .from('logging_config')
        .select('*')
        .eq('guild_id', interaction.guildId)
        .maybeSingle();

      if (existingConfig) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFF4B4B)
              .setTitle('⚠️ Logging Already Set Up')
              .setDescription('The Auron Logs system is already configured for this server.')
              .addFields(
                { name: 'Server Logs', value: `<#${existingConfig.server_logs_channel_id}>`, inline: true },
                { name: 'Message Logs', value: `<#${existingConfig.msg_logs_channel_id}>`, inline: true },
                { name: 'Mod Logs', value: `<#${existingConfig.mod_logs_channel_id}>`, inline: true }
              )
              .setFooter({ text: 'Auron Logs' })
              .setTimestamp()
          ]
        });
      }

      // Create the Auron Logs category
      const category = await interaction.guild.channels.create({
        name: '📋 Auron Logs',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ['ViewChannel']
          },
          {
            id: interaction.guild.members.me.id,
            allow: ['ViewChannel', 'SendMessages', 'EmbedLinks']
          }
        ]
      });

      // Create log channels
      const serverLogsChannel = await interaction.guild.channels.create({
        name: 'server-logs',
        type: ChannelType.GuildText,
        parent: category.id,
        topic: '📊 Server updates: joins, leaves, role changes, channel changes'
      });

      const msgLogsChannel = await interaction.guild.channels.create({
        name: 'msg-logs',
        type: ChannelType.GuildText,
        parent: category.id,
        topic: '💬 Message edits, deletes, and purges'
      });

      const modLogsChannel = await interaction.guild.channels.create({
        name: 'mod-logs',
        type: ChannelType.GuildText,
        parent: category.id,
        topic: '🔨 Kick, ban, timeout, quarantine actions'
      });

      // Save configuration to database
      await supabase.from('logging_config').insert({
        guild_id: interaction.guildId,
        category_id: category.id,
        server_logs_channel_id: serverLogsChannel.id,
        msg_logs_channel_id: msgLogsChannel.id,
        mod_logs_channel_id: modLogsChannel.id
      });

      // Update bot_config to use the new mod-logs channel
      await supabase
        .from('bot_config')
        .upsert({
          guild_id: interaction.guildId,
          mod_log_channel_id: modLogsChannel.id
        }, {
          onConflict: 'guild_id'
        });

      const embed = new EmbedBuilder()
        .setColor(0xF9D342)
        .setTitle('✅ Logging System Configured')
        .setDescription('Successfully created the Auron Logs system!')
        .addFields(
          { name: '📊 Server Logs', value: `${serverLogsChannel}`, inline: true },
          { name: '💬 Message Logs', value: `${msgLogsChannel}`, inline: true },
          { name: '🔨 Mod Logs', value: `${modLogsChannel}`, inline: true }
        )
        .setFooter({ text: 'Auron Logs' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Send welcome messages to each log channel
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('🚀 Auron Logging Initialized')
        .setDescription('This channel will log events automatically.')
        .setFooter({ text: 'Auron Logs' })
        .setTimestamp();

      await serverLogsChannel.send({ embeds: [welcomeEmbed] });
      await msgLogsChannel.send({ embeds: [welcomeEmbed] });
      await modLogsChannel.send({ embeds: [welcomeEmbed] });

    } catch (error) {
      console.error('Error setting up logging:', error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF4B4B)
            .setTitle('❌ Error')
            .setDescription('Failed to set up logging system. Make sure I have the necessary permissions.')
            .setFooter({ text: 'Auron Logs' })
        ]
      });
    }
  },
};
