# Auron Discord Bot - Complete Implementation

⚠️ **DEPRECATED**: This file contains the old monolithic bot code.

✅ **USE THE NEW STRUCTURE**: All bot code has been moved to the `bot-code/` folder with proper file organization:
- `bot-code/bot.js` - Main bot file
- `bot-code/deploy-commands.js` - Command deployment
- `bot-code/commands/` - Individual command files
- `bot-code/README.md` - Setup instructions

Please refer to `bot-code/README.md` for installation and usage instructions.

---

## Old Code (For Reference Only)

## Prerequisites

1. Node.js 18+ installed
2. Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)
3. Your Lovable Cloud database URL and key (from dashboard)

## Installation

```bash
npm init -y
npm install discord.js @supabase/supabase-js dotenv
```

## Create `.env` file

```env
DISCORD_TOKEN=your_discord_bot_token_here
GUILD_ID=your_guild_id_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

## Create `index.js` - Main Bot File

```javascript
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const GUILD_ID = process.env.GUILD_ID;

// ==================== SLASH COMMANDS ====================

const commands = [
  {
    name: 'help',
    description: 'Show all available commands',
  },
  {
    name: 'blacklist',
    description: 'Manage blacklisted words',
    options: [
      {
        name: 'action',
        description: 'Action to perform',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'list', value: 'list' },
        ],
      },
      {
        name: 'word',
        description: 'Word to add or remove',
        type: 3, // STRING
        required: false,
      },
    ],
  },
  {
    name: 'ticket',
    description: 'Manage support tickets',
    options: [
      {
        name: 'action',
        description: 'Action to perform',
        type: 3,
        required: true,
        choices: [
          { name: 'create', value: 'create' },
          { name: 'close', value: 'close' },
        ],
      },
    ],
  },
  {
    name: 'quarantine',
    description: 'Quarantine management',
    options: [
      {
        name: 'action',
        description: 'Action to perform',
        type: 3,
        required: true,
        choices: [
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
        ],
      },
      {
        name: 'user',
        description: 'User to quarantine',
        type: 6, // USER
        required: true,
      },
      {
        name: 'duration',
        description: 'Duration in minutes',
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
  {
    name: 'level',
    description: 'Check your level and XP',
  },
  {
    name: 'balance',
    description: 'Check your balance',
  },
  {
    name: 'daily',
    description: 'Claim your daily reward',
  },
];

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands,
    });
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// ==================== BOT EVENTS ====================

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  
  // Register commands
  await registerCommands();
  
  // Set bot status
  const { data: config } = await supabase
    .from('bot_config')
    .select('*')
    .eq('guild_id', GUILD_ID)
    .single();
  
  if (config) {
    client.user.setActivity(config.status_text, { type: config.status_type.toUpperCase() });
  } else {
    client.user.setActivity('/help', { type: 'PLAYING' });
  }
});

// ==================== MESSAGE HANDLER ====================

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // XP System
  await handleXP(message);
  
  // Check blacklist
  await checkBlacklist(message);
});

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

// ==================== SLASH COMMAND HANDLER ====================

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  const { commandName, options } = interaction;
  
  switch (commandName) {
    case 'help':
      await handleHelp(interaction);
      break;
    case 'blacklist':
      await handleBlacklist(interaction, options);
      break;
    case 'ticket':
      await handleTicket(interaction, options);
      break;
    case 'quarantine':
      await handleQuarantine(interaction, options);
      break;
    case 'level':
      await handleLevel(interaction);
      break;
    case 'balance':
      await handleBalance(interaction);
      break;
    case 'daily':
      await handleDaily(interaction);
      break;
  }
});

async function handleHelp(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xDC2626)
    .setTitle('📚 Auron Bot Commands')
    .setDescription('Here are all available commands:')
    .addFields(
      { name: '/help', value: 'Show this help message' },
      { name: '/blacklist', value: 'Manage blacklisted words' },
      { name: '/ticket', value: 'Create or close support tickets' },
      { name: '/quarantine', value: 'Quarantine users' },
      { name: '/level', value: 'Check your level and XP' },
      { name: '/balance', value: 'Check your balance' },
      { name: '/daily', value: 'Claim daily reward' }
    )
    .setTimestamp()
    .setFooter({ text: 'Auron Bot' });
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleBlacklist(interaction, options) {
  const action = options.getString('action');
  const word = options.getString('word');
  const guildId = interaction.guild.id;
  
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
  }
  
  if (action === 'list') {
    const { data: blacklist } = await supabase
      .from('blacklist_words')
      .select('word')
      .eq('guild_id', guildId);
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('🚫 Blacklisted Words')
      .setDescription(blacklist?.length ? blacklist.map(b => `• ${b.word}`).join('\n') : 'No words blacklisted')
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  if (!word) {
    return interaction.reply({ content: '❌ Please provide a word!', ephemeral: true });
  }
  
  if (action === 'add') {
    await supabase.from('blacklist_words').insert({
      guild_id: guildId,
      word: word.toLowerCase(),
      added_by: interaction.user.id,
    });
    
    await interaction.reply({ content: `✅ Added "${word}" to blacklist`, ephemeral: true });
  } else if (action === 'remove') {
    await supabase
      .from('blacklist_words')
      .delete()
      .eq('guild_id', guildId)
      .eq('word', word.toLowerCase());
    
    await interaction.reply({ content: `✅ Removed "${word}" from blacklist`, ephemeral: true });
  }
}

async function handleTicket(interaction, options) {
  const action = options.getString('action');
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  
  if (action === 'create') {
    // Create ticket channel
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0, // TEXT
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: userId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });
    
    // Save to database
    await supabase.from('tickets').insert({
      guild_id: guildId,
      user_id: userId,
      channel_id: channel.id,
      status: 'open',
      subject: 'Support Request',
    });
    
    const embed = new EmbedBuilder()
      .setColor(0xDC2626)
      .setTitle('🎫 Ticket Created')
      .setDescription(`Your ticket has been created in ${channel}`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else if (action === 'close') {
    const channelName = interaction.channel.name;
    if (!channelName.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
    }
    
    await supabase
      .from('tickets')
      .update({ status: 'closed', closed_at: new Date().toISOString(), closed_by: userId })
      .eq('channel_id', interaction.channel.id);
    
    await interaction.reply({ content: '✅ Ticket closed! This channel will be deleted in 5 seconds.', ephemeral: true });
    
    setTimeout(() => {
      interaction.channel.delete();
    }, 5000);
  }
}

async function handleQuarantine(interaction, options) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
  }
  
  const action = options.getString('action');
  const user = options.getUser('user');
  const duration = options.getInteger('duration') || 30;
  const guildId = interaction.guild.id;
  
  const member = await interaction.guild.members.fetch(user.id);
  
  if (action === 'add') {
    // Find or create quarantine role
    let role = interaction.guild.roles.cache.find(r => r.name === 'Quarantine');
    if (!role) {
      role = await interaction.guild.roles.create({
        name: 'Quarantine',
        color: 0x000000,
        permissions: [],
      });
    }
    
    await member.roles.add(role);
    
    await supabase.from('quarantine_logs').insert({
      guild_id: guildId,
      user_id: user.id,
      moderator_id: interaction.user.id,
      duration_minutes: duration,
      reason: 'Quarantined by moderator',
      status: 'active',
    });
    
    await interaction.reply({ content: `✅ ${user} has been quarantined for ${duration} minutes`, ephemeral: true });
  } else if (action === 'remove') {
    const role = interaction.guild.roles.cache.find(r => r.name === 'Quarantine');
    if (role) {
      await member.roles.remove(role);
    }
    
    await supabase
      .from('quarantine_logs')
      .update({ status: 'removed', removed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    await interaction.reply({ content: `✅ ${user} has been removed from quarantine`, ephemeral: true });
  }
}

async function handleLevel(interaction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;
  
  const { data: userLevel } = await supabase
    .from('user_levels')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();
  
  if (!userLevel) {
    return interaction.reply({ content: '❌ No level data found. Start chatting to gain XP!', ephemeral: true });
  }
  
  const xpNeeded = userLevel.level * 100;
  const progress = Math.round((userLevel.xp / xpNeeded) * 100);
  
  const embed = new EmbedBuilder()
    .setColor(0xDC2626)
    .setTitle('📊 Your Level')
    .setDescription(`**Level:** ${userLevel.level}\n**XP:** ${userLevel.xp}/${xpNeeded} (${progress}%)\n**Messages:** ${userLevel.total_messages}`)
    .setTimestamp()
    .setFooter({ text: 'Keep chatting to level up!' });
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleBalance(interaction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;
  
  const { data: balance } = await supabase
    .from('user_balances')
    .select('balance')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();
  
  const amount = balance?.balance || 0;
  
  const embed = new EmbedBuilder()
    .setColor(0xDC2626)
    .setTitle('💰 Your Balance')
    .setDescription(`**Balance:** ${amount} coins`)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleDaily(interaction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;
  
  const { data: balance } = await supabase
    .from('user_balances')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();
  
  const now = new Date();
  const lastDaily = balance?.last_daily ? new Date(balance.last_daily) : null;
  
  if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
    const timeLeft = 24 * 60 * 60 * 1000 - (now - lastDaily);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    return interaction.reply({ content: `❌ You already claimed your daily! Come back in ${hoursLeft} hours.`, ephemeral: true });
  }
  
  const reward = 100;
  const newBalance = (balance?.balance || 0) + reward;
  
  await supabase.from('user_balances').upsert({
    guild_id: guildId,
    user_id: userId,
    balance: newBalance,
    last_daily: now.toISOString(),
  });
  
  await supabase.from('economy_transactions').insert({
    guild_id: guildId,
    user_id: userId,
    amount: reward,
    transaction_type: 'daily',
    description: 'Daily reward',
    balance_after: newBalance,
  });
  
  const embed = new EmbedBuilder()
    .setColor(0xDC2626)
    .setTitle('✅ Daily Claimed!')
    .setDescription(`You received **${reward} coins**!\n\nNew balance: **${newBalance} coins**`)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Login
client.login(process.env.DISCORD_TOKEN);
```

## Running the Bot

```bash
node index.js
```

## Next Steps

1. Set up your Discord bot in the [Developer Portal](https://discord.com/developers/applications)
2. Enable all required intents (Server Members, Message Content, Presence)
3. Invite the bot to your server with Administrator permissions
4. Fill in your `.env` file with the correct values
5. Run the bot with `node index.js`

## Features Included

✅ Slash commands system
✅ Blacklist word management
✅ Ticket system
✅ Quarantine system
✅ XP and leveling system
✅ Economy system with daily rewards
✅ All data syncs with your dashboard
✅ Dark theme embedded messages
✅ AI-ready structure (add your own AI moderation logic)

## Notes

- The dashboard displays all data in real-time
- You can manage everything from both the dashboard and Discord
- Add your own AI moderation by integrating an AI API in the `checkBlacklist` function
- Customize the XP gain, daily rewards, and other values as needed
