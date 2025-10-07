const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { supabase } = require('../supabaseClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure the welcomer system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction, client) {
    const settings = await getWelcomerSettings(interaction.guildId);
    await showMainMenu(interaction, settings);
  },
};

async function getWelcomerSettings(guildId) {
  const { data, error } = await supabase
    .from('welcomer_settings')
    .select('*')
    .eq('guild_id', guildId)
    .maybeSingle();

  if (error) console.error('Error fetching welcomer settings:', error);
  
  return data || {
    guild_id: guildId,
    join_role_id: null,
    channel_id: null,
    message: null,
    embed_json: null,
    dm_message: null,
    dm_embed_json: null,
    auto_decancer: false
  };
}

async function showMainMenu(interaction, settings) {
  const guild = interaction.guild;
  const joinRole = settings.join_role_id ? guild.roles.cache.get(settings.join_role_id)?.name || 'Role not found' : 'No role found';
  const channel = settings.channel_id ? guild.channels.cache.get(settings.channel_id)?.name || 'Channel not found' : 'No channel found';
  
  const embed = new EmbedBuilder()
    .setColor(0x2B2D31)
    .setTitle('Welcome')
    .setDescription('Customize welcome settings')
    .addFields(
      { name: 'Join Role', value: joinRole, inline: true },
      { name: 'Channel', value: channel, inline: true },
      { name: 'Message', value: settings.message || 'Not set', inline: false },
      { name: 'Embed', value: settings.embed_json ? 'Set' : 'Not set', inline: true },
      { name: 'DM Message', value: settings.dm_message ? 'Set' : 'Not set', inline: true },
      { name: 'DM Embed', value: settings.dm_embed_json ? 'Set' : 'Not set', inline: true },
      { name: 'Auto Decancer', value: settings.auto_decancer ? 'Enabled' : 'Disabled', inline: true }
    )
    .setFooter({ text: 'Auron Welcomer' })
    .setTimestamp();

  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('welcome_change_role')
        .setLabel('Change Role')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('welcome_change_channel')
        .setLabel('Change Channel')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('welcome_change_message')
        .setLabel('Change Message')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('welcome_change_embed')
        .setLabel('Change Embed')
        .setStyle(ButtonStyle.Primary)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('welcome_change_dm_message')
        .setLabel('Change DM Message')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('welcome_change_dm_embed')
        .setLabel('Change DM Embed')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('welcome_toggle_decancer')
        .setLabel('Toggle Auto Decancer')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('welcome_remove_embed')
        .setLabel('Remove Embed')
        .setStyle(ButtonStyle.Danger)
    );

  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('welcome_remove_dm_embed')
        .setLabel('Remove DM Embed')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('welcome_test')
        .setLabel('Test')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('welcome_exit')
        .setLabel('Exit')
        .setStyle(ButtonStyle.Danger)
    );

  const method = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
  await interaction[method]({ embeds: [embed], components: [row1, row2, row3], ephemeral: true });
}

async function showEmbedEditor(interaction, isMainEmbed = true) {
  const settings = await getWelcomerSettings(interaction.guildId);
  const embedData = isMainEmbed ? settings.embed_json : settings.dm_embed_json;
  
  const embed = new EmbedBuilder()
    .setColor(0x2B2D31)
    .setTitle('Embed Customization')
    .setDescription('Use the buttons below to adjust the settings.')
    .addFields(
      { name: 'Current Title', value: embedData?.title || 'Not set', inline: false },
      { name: 'Current Description', value: embedData?.description || 'Not set', inline: false },
      { name: 'Current Color', value: embedData?.color || 'Not set', inline: true },
      { name: 'Image', value: embedData?.image?.url ? 'Set' : 'Not set', inline: true },
      { name: 'Thumbnail', value: embedData?.thumbnail?.url ? 'Set' : 'Not set', inline: true }
    )
    .setFooter({ text: 'Auron Welcomer • Embed Editor' })
    .setTimestamp();

  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`embed_title_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Title')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`embed_description_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Description')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`embed_color_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Color')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`embed_image_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Image')
        .setStyle(ButtonStyle.Secondary)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`embed_thumbnail_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Thumbnail')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`embed_preview_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('JSON Preview')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`embed_save_${isMainEmbed ? 'main' : 'dm'}`)
        .setLabel('Save Embed')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('embed_back')
        .setLabel('Back')
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row1, row2] });
}

module.exports.showMainMenu = showMainMenu;
module.exports.getWelcomerSettings = getWelcomerSettings;
module.exports.showEmbedEditor = showEmbedEditor;
