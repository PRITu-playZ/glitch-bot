const Discord = require('discord.js');
var mentionedUser = null;

module.exports = {
	name: 'defaultavatar',
	description: 'looks at someones default avatar',
	category: 'fun',
	run: async (client, message) => {
		if (!message.mentions.members.first()) {
			const avatarEmbed = new Discord.MessageEmbed()
				.setTitle('Default avatar of: ' + message.author.tag)
				.setColor('ffd000')
				.setImage(message.author.defaultAvatarURL);
			message.channel.send(avatarEmbed);
		}
		mentionedUser = message.mentions.members.first().user;
		const avatarEmbed = new Discord.MessageEmbed()
			.setTitle('Default avatar of: ' + mentionedUser.tag)
			.setColor('ffd000')
			.setImage(mentionedUser.defaultAvatarURL)
			.setFooter(`Requested by: ${message.author.tag}`);
		message.channel.send(avatarEmbed);
	}
};
