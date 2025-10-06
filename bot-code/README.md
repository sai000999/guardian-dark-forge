# Auron Discord Bot 🤖

Professional Discord bot with web dashboard integration for moderation, economy, leveling, and more.

## Features ✨

- 🛡️ **AI-Ready Moderation** - Blacklist system with automatic detection
- 🎫 **Ticket System** - Create private support channels
- 🔒 **Quarantine System** - Restrict problematic users
- 📊 **Leveling System** - XP and levels based on activity
- 💰 **Economy System** - Coins, daily rewards, and transfers
- 🎨 **Dark Theme Embeds** - Professional black/red embeds
- 📈 **Dashboard Integration** - Real-time sync with web dashboard

## Installation 🚀

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- Your Lovable Cloud credentials (from your dashboard)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_guild_id_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

### Step 3: Set Up Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or select existing)
3. Go to "Bot" section and create a bot
4. Copy the token and add it to `.env`
5. Enable these intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
   - ✅ Presence Intent

### Step 4: Invite Bot to Server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### Step 5: Deploy Commands

```bash
npm run deploy
```

### Step 6: Start the Bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Commands 📝

| Command | Description | Permissions |
|---------|-------------|-------------|
| `/help` | Show all commands | Everyone |
| `/blacklist add/remove/list` | Manage blacklisted words | Admin |
| `/ticket create/close` | Support ticket system | Everyone |
| `/quarantine add/remove` | Quarantine users | Admin |
| `/level [user]` | Check level and XP | Everyone |
| `/balance [user]` | Check coin balance | Everyone |
| `/daily` | Claim daily reward | Everyone |
| `/give <user> <amount>` | Transfer coins | Everyone |
| `/shop` | View economy shop | Everyone |

## Project Structure 📁

```
bot-code/
├── bot.js                 # Main bot file
├── deploy-commands.js     # Command deployment script
├── package.json          # Dependencies
├── .env                  # Environment variables (create this)
├── .env.example         # Environment template
├── README.md            # This file
└── commands/            # Command files
    ├── help.js
    ├── blacklist.js
    ├── ticket.js
    ├── quarantine.js
    ├── level.js
    ├── balance.js
    ├── daily.js
    ├── give.js
    └── shop.js
```

## Configuration ⚙️

### Bot Status

The bot status is controlled from the dashboard's "Bot Status" page. You can set:
- Status type (Playing, Watching, Listening, Competing)
- Status text
- Mod log channel ID

### Customization

**XP Rates** - Edit in `bot.js` line 92:
```javascript
const xpGain = Math.floor(Math.random() * 15) + 10; // 10-25 XP per message
```

**Level Formula** - Edit in `bot.js` line 95:
```javascript
const xpNeeded = currentLevel * 100; // 100 XP per level
```

**Daily Reward** - Edit in `commands/daily.js` line 33:
```javascript
const reward = 100; // 100 coins per day
```

## Troubleshooting 🔧

### Commands not showing up?
```bash
npm run deploy
```

### Bot offline?
- Check your `DISCORD_TOKEN` in `.env`
- Make sure bot is invited with proper permissions
- Check console for error messages

### Database issues?
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check dashboard to ensure tables exist
- Look at browser console in dashboard for errors

### Permission errors?
- Bot needs Administrator permission
- Or manually grant: Manage Channels, Manage Roles, Kick Members, Ban Members

## Adding New Commands 🆕

1. Create a new file in `commands/` folder:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description'),
  
  async execute(interaction, client) {
    // Your command logic here
    await interaction.reply('Hello!');
  },
};
```

2. Deploy the new command:
```bash
npm run deploy
```

3. Restart the bot:
```bash
npm start
```

## Dashboard Integration 📊

The bot automatically syncs with your web dashboard:
- All moderation actions appear in "Mod Logs"
- Blacklisted words sync in real-time
- Tickets visible in "Tickets" page
- User levels tracked in "Levels" page
- Economy transactions logged in "Economy" page

## Support 💬

- Check the dashboard for real-time data
- View console logs for errors
- Test commands in a private server first

## License 📄

MIT License - feel free to modify and use for your server!
