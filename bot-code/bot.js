require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
      activities: [{ name: '/help', type: 0 }],
      status: 'online'
    });
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
});

// Login
client.login(process.env.DISCORD_TOKEN);
