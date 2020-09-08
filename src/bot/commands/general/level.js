const Discord = require("discord.js");
const path = require("path");
const canvas = require("canvas");

module.exports = {
    name: "level",
    description: "shows your level",
    category: "general",
    run: async (client, messageObject) => {
        if (!messageObject.message.guild.me.hasPermission("SEND_MESSAGES")) {
            return;
        }

        let xp = require(path.resolve(`src/bot/databases/xp/xp-${messageObject.message.guild.id}.json`));
        if (!xp[messageObject.message.author.id]) {
            xp[messageObject.message.author.id] = {
                xp: 0,
                level: 1
            };
        }
        fs.writeFile(
        path.resolve(`src/bot/databases/xp/xp-${messageObject.message.guild.id}.json`),
        JSON.stringify(xp), function(err) {
            if (err) console.log('error', err);
        });
        let curxp = xp[messageObject.message.author.id].xp;
        let curlvl = xp[messageObject.message.author.id].level;
        let nxtLvlXp = curlvl * 300 * 1.2;

        let image = canvas.createCanvas(200, 100)
        //uncomment when used
        //let ctxAvatar = image.getContext("2d");
        let xpCtx = image.getContext("2d");
        let xpText = curxp + "/" + nxtLvlXp + " xp to level " + curlvl + 1;
        xpCtx.font = '12px "Comic Sans"'
        xpCtx.fillText(xpText, 0, 0)
        let attachment = new Discord.MessageAttachment(image.toBuffer());

        return messageObject.message.channel.send(attachment);
    }
}
