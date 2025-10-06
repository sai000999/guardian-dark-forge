const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('🤖 Auron Bot Commands')
      .setDescription('Professional Discord management with advanced features\n━━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
        { 
          name: '🛡️ Moderation Commands', 
          value: '`/kick <user> [reason]` - Kick a user from server\n`/ban <user> [reason]` - Ban a user permanently\n`/timeout <user> <duration> [reason]` - Temporarily mute user\n`/disconnect <user>` - Disconnect user from voice\n`/quarantine <user> [reason]` - Quarantine a user\n`/blacklist` - Manage blacklisted words', 
          inline: false 
        },
        { 
          name: '🎤 Voice Management', 
          value: '`/vc-move <user> <channel>` - Move user to voice channel\n`/vc-moveall <source> <destination>` - Move all users between VCs', 
          inline: false 
        },
        { 
          name: '🎫 Support Tickets', 
          value: '`/ticket-setup <channel> <staff-role>` - Configure ticket system\n• Use ticket panel buttons to create/manage tickets\n• Includes claim, close, add/remove member features', 
          inline: false 
        },
        { 
          name: '💰 Economy System', 
          value: '`/balance [user]` - Check coin balance\n`/shop` - View and purchase items\n`/daily` - Claim daily reward\n`/give <user> <amount>` - Transfer coins\n\n**Earning:** 5 coins/10 messages • 100 coins/10 min voice', 
          inline: false 
        },
        { 
          name: '⚙️ Shop Configuration (Admin)', 
          value: '`/vip-role setup <role>` - Set VIP role (5000 coins)\n`/vcaccess-role setup <role>` - Set VC access role (8000 coins)\n`/hexrole add <role>` - Set color role access (2000 coins)', 
          inline: false 
        },
        { 
          name: '🧠 Channel Monitor System (Admin)', 
          value: '`/monitor <channel>` - Start monitoring for inactivity\n`/monitor-stop <channel>` - Stop monitoring a channel\n`/monitor-list` - List all monitored channels\n`/inactivity-timer set <minutes>` - Set inactivity timeout (5-120 min)', 
          inline: false 
        },
        { 
          name: '📊 Leveling & Utility', 
          value: '`/level [user]` - Check user level and XP\n`/afk [reason]` - Set AFK status', 
          inline: false 
        },
        { 
          name: '🤖 AI Features', 
          value: '• **Anti-Spam AutoMod** - Auto-detects spam (5+ msgs/10s)\n• **Smart Channel Monitor** - Sends engaging questions when channels are quiet\n• Automatically times out spammers for 10 minutes', 
          inline: false 
        }
      )
      .setFooter({ text: 'Auron Bot • Professional Discord Management System' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
