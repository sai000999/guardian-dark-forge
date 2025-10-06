const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage blacklisted words')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a word to the blacklist')
        .addStringOption(option =>
          option
            .setName('word')
            .setDescription('The word to blacklist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a word from the blacklist')
        .addStringOption(option =>
          option
            .setName('word')
            .setDescription('The word to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View all blacklisted words')
    ),
  
  async execute(interaction, client) {
    const supabase = client.supabase;
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    
    // Check permissions for add/remove
    if (subcommand !== 'list' && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission!', ephemeral: true });
    }
    
    if (subcommand === 'list') {
      const { data: blacklist } = await supabase
        .from('blacklist_words')
        .select('word, added_by, created_at')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false });
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('🚫 Blacklisted Words')
        .setDescription(
          blacklist?.length 
            ? blacklist.map((b, i) => `${i + 1}. **${b.word}**`).join('\n')
            : 'No words blacklisted'
        )
        .setFooter({ text: `Total: ${blacklist?.length || 0} words` })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    const word = interaction.options.getString('word');
    
    if (subcommand === 'add') {
      const { error } = await supabase.from('blacklist_words').insert({
        guild_id: guildId,
        word: word.toLowerCase(),
        added_by: interaction.user.id,
      });
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return interaction.reply({ content: '❌ This word is already blacklisted!', ephemeral: true });
        }
        throw error;
      }
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('✅ Word Blacklisted')
        .setDescription(`"**${word}**" has been added to the blacklist`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      
    } else if (subcommand === 'remove') {
      const { error } = await supabase
        .from('blacklist_words')
        .delete()
        .eq('guild_id', guildId)
        .eq('word', word.toLowerCase());
      
      if (error) throw error;
      
      const embed = new EmbedBuilder()
        .setColor(0xDC2626)
        .setTitle('✅ Word Removed')
        .setDescription(`"**${word}**" has been removed from the blacklist`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
