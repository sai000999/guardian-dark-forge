require('dotenv').config();

// Polyfill for ReadableStream (Node.js < 18 compatibility)
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('web-streams-polyfill');
  globalThis.ReadableStream = ReadableStream;
}

const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { supabase } = require('./supabaseClient');
const fs = require('fs');
const path = require('path');

// Random questions for channel monitoring
const randomQuestions = [
  "What's a small decision that changed your life?",
  "If you could teleport anywhere right now, where would you go?",
  "What's your dream meal if calories didn't exist?",
  "What's one hobby you could talk about for hours?",
  "Would you rather explore space or the deep sea?",
  "What's your go-to comfort movie?",
  "If you could meet your future self for one minute, what would you ask?",
  "What's one thing that instantly improves your day?",
  "If you could have any superpower for a day, what would it be?",
  "What's the weirdest food combination you secretly love?"
];

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] Command at ${filePath} is missing "data" or "execute"`);
  }
}

const GUILD_ID = process.env.GUILD_ID;

// Export supabase for use in commands
client.supabase = supabase;

// ==================== BOT EVENTS ====================

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  
  // Set bot status
  const { data: config } = await supabase
    .from('bot_config')
    .select('*')
    .eq('guild_id', GUILD_ID)
    .single();
  
  if (config) {
    const activityTypes = {
      'Playing': 0,
      'Streaming': 1,
      'Listening': 2,
      'Watching': 3,
      'Competing': 5,
    };
    
    client.user.setPresence({
      activities: [{
        name: config.status_text,
        type: activityTypes[config.status_type] || 0
      }],
      status: 'online'
    });
  } else {
    client.user.setPresence({
      activities: [{ name: '/help • Watching chat activity 👀', type: 0 }],
      status: 'online'
    });
  }
  
  // Start channel monitoring interval (check every minute)
  setInterval(() => checkMonitoredChannels(client), 60000);
  console.log('🔄 Channel monitoring system started');
});

// ==================== MESSAGE HANDLER ====================

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // AFK System
  await handleAFK(message);
  
  // XP System
  await handleXP(message);
  
  // Economy - Message coins
  await handleMessageCoins(message);
  
  // Anti-Spam AutoMod
  await handleAntiSpam(message);
  
  // Check blacklist
  await checkBlacklist(message);
  
  // Update monitored channel activity
  await updateChannelActivity(message.channel.id, message.guild.id);
});

async function handleAFK(message) {
  try {
    // Check if user is AFK
    const { data: afkData, error: afkError } = await supabase
      .from('afk_status')
      .select('*')
      .eq('user_id', message.author.id)
      .eq('guild_id', message.guild.id)
      .maybeSingle();

    if (afkError) {
      console.error('Error checking AFK status:', afkError);
      return;
    }

    if (afkData) {
      // Remove AFK status
      await supabase
        .from('afk_status')
        .delete()
        .eq('user_id', message.author.id)
        .eq('guild_id', message.guild.id);

      await message.reply(`Welcome back ${message.author}! Your AFK status has been removed.`);
    }

    // Check if mentioned users are AFK
    for (const user of message.mentions.users.values()) {
      const { data: mentionedAfk } = await supabase
        .from('afk_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('guild_id', message.guild.id)
        .maybeSingle();

      if (mentionedAfk) {
        const afkTime = new Date(mentionedAfk.set_at);
        const now = new Date();
        const timeDiff = Math.floor((now - afkTime) / 1000 / 60); // minutes
        
        await message.reply(`💤 ${user.tag} is currently AFK: ${mentionedAfk.reason} (${timeDiff} minutes ago)`);
      }
    }
  } catch (error) {
    console.error('Error handling AFK:', error);
  }
}

async function handleXP(message) {
  const userId = message.author.id;
  const guildId = message.guild.id;
  
  // Get or create user level
  const { data: userLevel } = await supabase
    .from('user_levels')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();
  
  const xpGain = Math.floor(Math.random() * 15) + 10;
  const newXP = (userLevel?.xp || 0) + xpGain;
  const currentLevel = userLevel?.level || 1;
  const xpNeeded = currentLevel * 100;
  
  let newLevel = currentLevel;
  if (newXP >= xpNeeded) {
    newLevel = currentLevel + 1;
    
    // Level up message
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('🎉 Level Up!')
      .setDescription(`Congratulations ${message.author}! You've reached **Level ${newLevel}**!`)
      .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
  }
  
  await supabase.from('user_levels').upsert({
    guild_id: guildId,
    user_id: userId,
    level: newLevel,
    xp: newXP >= xpNeeded ? newXP - xpNeeded : newXP,
    total_messages: (userLevel?.total_messages || 0) + 1,
    last_xp_gain: new Date().toISOString(),
  });
}

async function checkBlacklist(message) {
  const guildId = message.guild.id;
  const content = message.content.toLowerCase();
  
  const { data: blacklist } = await supabase
    .from('blacklist_words')
    .select('word')
    .eq('guild_id', guildId);
  
  if (!blacklist) return;
  
  for (const item of blacklist) {
    if (content.includes(item.word.toLowerCase())) {
      // Delete message
      await message.delete().catch(console.error);
      
      // Log violation
      await supabase.from('moderation_logs').insert({
        guild_id: guildId,
        user_id: message.author.id,
        moderator_id: client.user.id,
        action_type: 'warning',
        reason: `Blacklisted word detected: ${item.word}`,
        severity: 'moderate',
      });
      
      // Send warning
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('⚠️ Warning')
        .setDescription(`${message.author}, your message contained a blacklisted word and has been removed.`)
        .setTimestamp();
      
      message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
      
      break;
    }
  }
}

// ==================== VOICE STATE HANDLER ====================

client.on('voiceStateUpdate', async (oldState, newState) => {
  const supabase = client.supabase;
  const guildId = newState.guild.id;
  const userId = newState.member.id;
  
  // User joined a voice channel
  if (!oldState.channelId && newState.channelId) {
    await supabase.from('voice_sessions').insert({
      guild_id: guildId,
      user_id: userId,
      channel_id: newState.channelId,
      join_time: new Date().toISOString(),
    });
  }
  
  // User left a voice channel
  if (oldState.channelId && !newState.channelId) {
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .eq('channel_id', oldState.channelId)
      .is('leave_time', null)
      .order('join_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (session) {
      const joinTime = new Date(session.join_time);
      const leaveTime = new Date();
      const durationMinutes = Math.floor((leaveTime - joinTime) / 1000 / 60);
      
      await supabase
        .from('voice_sessions')
        .update({
          leave_time: leaveTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', session.id);
      
      // Award coins (100 coins per 10 minutes)
      const coinsEarned = Math.floor(durationMinutes / 10) * 100;
      if (coinsEarned > 0) {
        const { data: balance } = await supabase
          .from('user_balances')
          .select('*')
          .eq('guild_id', guildId)
          .eq('user_id', userId)
          .maybeSingle();
        
        const newBalance = (balance?.balance || 0) + coinsEarned;
        
        await supabase.from('user_balances').upsert({
          guild_id: guildId,
          user_id: userId,
          balance: newBalance,
        });
        
        await supabase.from('economy_transactions').insert({
          guild_id: guildId,
          user_id: userId,
          amount: coinsEarned,
          transaction_type: 'earn',
          description: `Voice activity reward (${durationMinutes} minutes)`,
          balance_after: newBalance,
        });
      }
    }
  }
});

// ==================== MESSAGE COINS HANDLER ====================

let messageCounters = new Map(); // userId -> { count, lastReset }

async function handleMessageCoins(message) {
  const userId = message.author.id;
  const guildId = message.guild.id;
  
  if (!messageCounters.has(userId)) {
    messageCounters.set(userId, { count: 0, lastReset: Date.now() });
  }
  
  const counter = messageCounters.get(userId);
  counter.count++;
  
  // Reset counter every 10 messages
  if (counter.count >= 10) {
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();
    
    const newBalance = (balance?.balance || 0) + 5;
    
    await supabase.from('user_balances').upsert({
      guild_id: guildId,
      user_id: userId,
      balance: newBalance,
    });
    
    await supabase.from('economy_transactions').insert({
      guild_id: guildId,
      user_id: userId,
      amount: 5,
      transaction_type: 'earn',
      description: 'Message activity reward (10 messages)',
      balance_after: newBalance,
    });
    
    counter.count = 0;
  }
}

// ==================== ANTI-SPAM AUTOMOD ====================

let spamTracking = new Map(); // userId -> [timestamps]

async function handleAntiSpam(message) {
  const userId = message.author.id;
  const guildId = message.guild.id;
  const now = Date.now();
  
  if (!spamTracking.has(userId)) {
    spamTracking.set(userId, []);
  }
  
  const timestamps = spamTracking.get(userId);
  
  // Remove timestamps older than 10 seconds
  const recentTimestamps = timestamps.filter(t => now - t < 10000);
  recentTimestamps.push(now);
  spamTracking.set(userId, recentTimestamps);
  
  // Check if user sent more than 5 messages in 10 seconds
  if (recentTimestamps.length > 5) {
    try {
      // Delete recent spam messages
      const recentMessages = await message.channel.messages.fetch({ limit: 10 });
      const userMessages = recentMessages.filter(m => m.author.id === userId);
      await message.channel.bulkDelete(userMessages).catch(console.error);
      
      // Timeout user for 10 minutes
      await message.member.timeout(10 * 60 * 1000, 'Excessive spamming detected');
      
      // Log to database
      await supabase.from('moderation_logs').insert({
        guild_id: guildId,
        user_id: userId,
        moderator_id: client.user.id,
        action_type: 'timeout',
        reason: 'Auto-mod: Excessive spamming detected',
        severity: 'moderate',
        duration_minutes: 10,
      });
      
      // Send log embed
      const { data: config } = await supabase
        .from('bot_config')
        .select('mod_log_channel_id')
        .eq('guild_id', guildId)
        .maybeSingle();
      
      if (config?.mod_log_channel_id) {
        const logChannel = message.guild.channels.cache.get(config.mod_log_channel_id);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor(0xDC2626)
            .setTitle('🚫 Anti-Spam Triggered')
            .setDescription(`**User:** <@${userId}>\n**Reason:** Excessive spamming detected\n**Action:** Timed out for 10 minutes`)
            .setTimestamp();
          
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
      
      // Clear spam tracking for this user
      spamTracking.delete(userId);
      
    } catch (error) {
      console.error('Error handling spam:', error);
    }
  }
}

// ==================== CHANNEL MONITORING SYSTEM ====================

// Update monitored channel activity
async function updateChannelActivity(channelId, guildId) {
  try {
    const { error } = await supabase
      .from('monitored_channels')
      .update({ last_active: new Date().toISOString() })
      .eq('guild_id', guildId)
      .eq('channel_id', channelId)
      .eq('active', true);

    if (!error) {
      console.log(`🔁 Activity detected in channel ${channelId} — timer reset.`);
    }
  } catch (error) {
    console.error('Error updating channel activity:', error);
  }
}

// Check monitored channels for inactivity
async function checkMonitoredChannels(client) {
  try {
    const { data: channels, error } = await supabase
      .from('monitored_channels')
      .select('*')
      .eq('active', true);

    if (error || !channels) return;

    for (const channel of channels) {
      // Get inactivity timeout for this guild
      const { data: settings } = await supabase
        .from('inactivity_settings')
        .select('timeout_minutes')
        .eq('guild_id', channel.guild_id)
        .maybeSingle();

      const timeoutMinutes = settings?.timeout_minutes || 15;
      const lastActive = new Date(channel.last_active);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastActive) / 60000);

      if (diffMinutes >= timeoutMinutes) {
        // Send random question
        const guild = client.guilds.cache.get(channel.guild_id);
        if (!guild) continue;

        const textChannel = guild.channels.cache.get(channel.channel_id);
        if (!textChannel) continue;

        const question = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];

        const embed = new EmbedBuilder()
          .setTitle('🖤 Conversation Breaker')
          .setDescription(`It's been quiet for a while... 👀\n\n**Question:** ${question}\n\n💬 Reply to restart the timer!`)
          .setColor('#111111')
          .setFooter({ text: 'Auron Chat Monitor • Keeping the vibes alive' })
          .setTimestamp();

        await textChannel.send({ embeds: [embed] });

        // Update last_active to prevent spam
        await supabase
          .from('monitored_channels')
          .update({ last_active: new Date().toISOString() })
          .eq('id', channel.id);

        console.log(`💬 Sent conversation breaker in #${textChannel.name} (${guild.name})`);
      }
    }
  } catch (error) {
    console.error('Error checking monitored channels:', error);
  }
}

// ==================== BUTTON & INTERACTION HANDLER ====================

client.on('interactionCreate', async (interaction) => {
  const supabase = client.supabase;
  
  // Handle slash commands
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      const errorMessage = { content: '❌ There was an error executing this command!', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
    return;
  }
  
  // Handle button clicks
  if (interaction.isButton()) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    
    // Ticket Panel - Create Ticket
    if (interaction.customId === 'create_ticket') {
      // Check if user already has an open ticket
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('*')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .eq('status', 'open')
        .maybeSingle();
      
      if (existingTicket) {
        return interaction.reply({ 
          content: '❌ You already have an open ticket!', 
          ephemeral: true 
        });
      }
      
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Get ticket config
        const { data: config } = await supabase
          .from('ticket_config')
          .select('*')
          .eq('guild_id', guildId)
          .maybeSingle();
        
        if (!config) {
          return interaction.editReply({ 
            content: '❌ Ticket system not configured!', 
          });
        }
        
        const ticketChannel = interaction.guild.channels.cache.get(config.ticket_channel_id);
        if (!ticketChannel) {
          return interaction.editReply({ 
            content: '❌ Ticket channel not found!', 
          });
        }
        
        // Create thread
        const thread = await ticketChannel.threads.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.PrivateThread,
          reason: 'Support ticket created',
        });
        
        // Add user and staff to thread
        await thread.members.add(userId);
        const staffRole = interaction.guild.roles.cache.get(config.staff_role_id);
        
        // Save to database
        await supabase.from('tickets').insert({
          guild_id: guildId,
          user_id: userId,
          channel_id: ticketChannel.id,
          thread_id: thread.id,
          status: 'open',
          subject: 'Support Request',
        });
        
        // Send welcome message
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0xDC2626)
          .setTitle('🎟️ Support Ticket')
          .setDescription(`Our support team ${staffRole} will be here soon. Please describe your issue below.`)
          .setFooter({ text: 'Auron Support System' })
          .setTimestamp();
        
        const controlButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('claim_ticket')
              .setLabel('Claim Ticket')
              .setEmoji('🧍‍♂️')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Close Ticket')
              .setEmoji('🚪')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('add_member')
              .setLabel('Add Member')
              .setEmoji('➕')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('remove_member')
              .setLabel('Remove Member')
              .setEmoji('➖')
              .setStyle(ButtonStyle.Secondary)
          );
        
        await thread.send({ content: `${staffRole}`, embeds: [welcomeEmbed], components: [controlButtons] });
        
        await interaction.editReply({ 
          content: `✅ Ticket created! ${thread}`, 
        });
        
      } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({ 
          content: '❌ Failed to create ticket.', 
        });
      }
    }
    
    // Support Info
    if (interaction.customId === 'support_info') {
      const infoEmbed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🧾 Support Information')
        .setDescription('**How to get support:**\n\n1. Click 🎫 Create Ticket\n2. A private thread will be created\n3. Describe your issue\n4. Staff will assist you\n5. Your ticket will be closed when resolved')
        .setFooter({ text: 'Auron Support System' });
      
      await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
    }
    
    // Claim Ticket
    if (interaction.customId === 'claim_ticket') {
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('thread_id', interaction.channel.id)
        .maybeSingle();
      
      if (!ticket) {
        return interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
      }
      
      if (ticket.claimed_by) {
        return interaction.reply({ content: '❌ Ticket already claimed!', ephemeral: true });
      }
      
      await supabase
        .from('tickets')
        .update({ 
          claimed_by: userId,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', ticket.id);
      
      const claimEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Ticket Claimed')
        .setDescription(`This ticket has been claimed by <@${userId}>`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [claimEmbed] });
    }
    
    // Close Ticket
    if (interaction.customId === 'close_ticket') {
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('thread_id', interaction.channel.id)
        .maybeSingle();
      
      if (!ticket) {
        return interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
      }
      
      await supabase
        .from('tickets')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_by: userId,
        })
        .eq('id', ticket.id);
      
      const closeEmbed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🎫 Ticket Closed')
        .setDescription('This ticket has been closed. Thread will be archived.')
        .setTimestamp();
      
      await interaction.reply({ embeds: [closeEmbed] });
      
      setTimeout(async () => {
        await interaction.channel.setArchived(true);
      }, 3000);
    }
    
    // Add Member Modal
    if (interaction.customId === 'add_member') {
      const modal = new ModalBuilder()
        .setCustomId('add_member_modal')
        .setTitle('Add Member to Ticket');
      
      const userInput = new TextInputBuilder()
        .setCustomId('user_input')
        .setLabel('User ID or Mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      modal.addComponents(new ActionRowBuilder().addComponents(userInput));
      await interaction.showModal(modal);
    }
    
    // Remove Member Modal
    if (interaction.customId === 'remove_member') {
      const modal = new ModalBuilder()
        .setCustomId('remove_member_modal')
        .setTitle('Remove Member from Ticket');
      
      const userInput = new TextInputBuilder()
        .setCustomId('user_input')
        .setLabel('User ID or Mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      
      modal.addComponents(new ActionRowBuilder().addComponents(userInput));
      await interaction.showModal(modal);
    }
    
    // Shop - Buy VIP
    if (interaction.customId === 'buy_vip') {
      await handleShopPurchase(interaction, 'vip', 5000);
    }
    
    // Shop - Buy VC Access
    if (interaction.customId === 'buy_vcaccess') {
      await handleShopPurchase(interaction, 'vcaccess', 8000);
    }
    
    // Shop - Buy Hex Role
    if (interaction.customId === 'buy_hexrole') {
      await handleShopPurchase(interaction, 'hexrole', 2000);
    }
  }
  
  // Handle modals
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'add_member_modal') {
      const userInput = interaction.fields.getTextInputValue('user_input');
      const userId = userInput.replace(/[<@!>]/g, '');
      
      try {
        await interaction.channel.members.add(userId);
        await interaction.reply({ content: `✅ Added <@${userId}> to ticket`, ephemeral: true });
      } catch (error) {
        await interaction.reply({ content: '❌ Failed to add member', ephemeral: true });
      }
    }
    
    if (interaction.customId === 'remove_member_modal') {
      const userInput = interaction.fields.getTextInputValue('user_input');
      const userId = userInput.replace(/[<@!>]/g, '');
      
      try {
        await interaction.channel.members.remove(userId);
        await interaction.reply({ content: `✅ Removed <@${userId}> from ticket`, ephemeral: true });
      } catch (error) {
        await interaction.reply({ content: '❌ Failed to remove member', ephemeral: true });
      }
    }
  }
});

// ==================== SHOP PURCHASE HANDLER ====================

async function handleShopPurchase(interaction, itemType, price) {
  const supabase = client.supabase;
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  
  await interaction.deferReply({ ephemeral: true });
  
  try {
    // Check balance
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!balance || balance.balance < price) {
      return interaction.editReply({ 
        content: `❌ Insufficient funds! You need **${price}** coins but have **${balance?.balance || 0}** coins.`, 
      });
    }
    
    // Get shop config
    const { data: shopConfig } = await supabase
      .from('shop_config')
      .select('*')
      .eq('guild_id', guildId)
      .maybeSingle();
    
    let roleId;
    let itemName;
    
    if (itemType === 'vip') {
      roleId = shopConfig?.vip_role_id;
      itemName = 'VIP Role';
    } else if (itemType === 'vcaccess') {
      roleId = shopConfig?.vcaccess_role_id;
      itemName = 'Private VC Access';
    } else if (itemType === 'hexrole') {
      roleId = shopConfig?.hexrole_role_id;
      itemName = 'Role Colors Access';
    }
    
    if (!roleId) {
      return interaction.editReply({ 
        content: '❌ This item is not configured yet!', 
      });
    }
    
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.editReply({ 
        content: '❌ Role not found!', 
      });
    }
    
    // Check if user already has role
    if (interaction.member.roles.cache.has(roleId)) {
      return interaction.editReply({ 
        content: '❌ You already have this item!', 
      });
    }
    
    // Deduct coins
    const newBalance = balance.balance - price;
    
    await supabase.from('user_balances').update({
      balance: newBalance,
    }).eq('guild_id', guildId).eq('user_id', userId);
    
    await supabase.from('economy_transactions').insert({
      guild_id: guildId,
      user_id: userId,
      amount: -price,
      transaction_type: 'spend',
      description: `Purchased ${itemName}`,
      balance_after: newBalance,
    });
    
    // Assign role
    await interaction.member.roles.add(role);
    
    const successEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Purchase Successful')
      .setDescription(`You purchased **${itemName}**!\n\n**Cost:** ${price} coins\n**Remaining Balance:** ${newBalance} coins`)
      .setTimestamp();
    
    await interaction.editReply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error processing purchase:', error);
    await interaction.editReply({ 
      content: '❌ Failed to process purchase.', 
    });
  }
}

// Login
client.login(process.env.DISCORD_TOKEN);
