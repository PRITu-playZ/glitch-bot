const Discord = require('discord.js');

module.exports = {
    name: 'info',
    description: 'user information',
    category: "general",
    run(client, message) {
        const member = message.mentions.members.first() || message.member;
        const user = message.author;

        const embed = new Discord.MessageEmbed()
            .setTitle(`${user.username}`)
            .setColor("RANDOM")
            .setThumbnail(user.displayAvatarURL)
            .addField('Username', user.username, true)
            .addField('Nickname', member.username, true)
            .addField('ID', user.id, true)
            .addField('Account Created', user.createdAt.toDateString(), true)
            .addField('Joined Server', member.joinedAt.toDateString(), true)
            .setFooter('User Info', user.displayAvatarURL);

        message.channel.send(embed);
    },
};