const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets (legacy command - use ticket panel instead)'),
  
  async execute(interaction, client) {
    await interaction.reply({ 
      content: '❌ Please use the ticket panel to create tickets. Ask an admin to run `/ticket-setup` if not configured.', 
      ephemeral: true 
    });
  },
};
