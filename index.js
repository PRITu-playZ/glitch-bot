const Discord = require("discord.js");
const { config } = require("dotenv");
const http = require('http');
const fs = require('fs');
const developers = require("./databases/developers.json");
const botconfig = require("./botconfig.json");
const client = new Discord.Client({
    disableEveryone: true
})
const DBL = require("dblapi.js");
var dbl = new DBL(process.env.TOPAPI, client);

fs.readFile('./site/index.html', function(err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    }).listen(8000);
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.username}. With ${client.users.size} users using ${client.channels.size} channels in ${client.guilds.size} servers`);
    client.user.setActivity(` ${client.guilds.size} servers and ${client.users.size} users`, { type: "WATCHING" });
    setInterval(() => {
        dbl.postStats(client.guilds.size);
    }, 1800000);
})

const defaultJSON = "{}"

let blacklistedservers = require("./databases/blacklistedservers.json")

client.on("message", async message => {

    if (botconfig.dev != true) {

        if (!blacklistedservers[message.guild.id]) {
            blacklistedservers[message.guild.id] = false;
            fs.writeFile(`./databases/blacklistedservers.json`, JSON.stringify(blacklistedservers), (err) => {
                if (err) console.log(err)
            });
        }

        if (blacklistedservers[message.guild.id] === true) {
            return;
        }

        if (fs.existsSync(`./databases/guild info/${message.guild.id}.json`)) {

        }
        else {
            fs.writeFileSync(`./databases/guild info/${message.guild.id}.json`, defaultJSON);
        }

        if (fs.existsSync(`./databases/xp/xp-${message.guild.id}.json`)) {

        }
        else {
            fs.writeFileSync(`./databases/xp/xp-${message.guild.id}.json`, defaultJSON);
        }

        if (fs.existsSync(`./databases/munten/munten-${message.guild.id}.json`)) {

        }
        else {
            fs.writeFileSync(`./databases/munten/munten-${message.guild.id}.json`, defaultJSON);
        }

        let guild_info = require(`./databases/guild info/${message.guild.id}.json`)
        let xp = require(`./databases/xp/xp-${message.guild.id}.json`);
        let munten = require(`./databases/munten/munten-${message.guild.id}.json`);

        if (!guild_info.prefix) {
            guild_info = {
                prefix: botconfig.defaultprefix
            }
        }

        fs.writeFile(`./databases/guild info/${message.guild.id}.json`, JSON.stringify(guild_info), (err) => {
            if (err) console.log(err)
        });

        const prefix = guild_info.prefix;

        if (message.author.bot) return;

        if (!message.guild) return;

        if (message.content.startsWith(prefix)) return;

        let xpAdd = Math.floor(Math.random() * 7) + 8;

        if (!xp[message.author.id]) {
            xp[message.author.id] = {
                xp: 0,
                level: 1
            };
        }


        let curxp = xp[message.author.id].xp;
        let curlvl = xp[message.author.id].level;
        let nxtLvl = xp[message.author.id].level * 300 * 1.2;
        xp[message.author.id].xp = curxp + xpAdd;
        if (nxtLvl <= xp[message.author.id].xp) {
            xp[message.author.id].level = curlvl + 1;
            let lvlup = new Discord.RichEmbed()
                .setTitle("Level Up!")
                .setColor("ffd000")
                .addField("New Level", curlvl + 1);

            message.channel.send(lvlup);
        }
        fs.writeFile(`./databases/xp/xp-${message.guild.id}.json`, JSON.stringify(xp), (err) => {
            if (err) console.log(err)
        });

        if (!munten[message.author.id]) {
            munten[message.author.id] = {
                munten: 0,
                volgende_munt: 5
            };
        }

        munten[message.author.id].volgende_munt -= 1;

        if (munten[message.author.id].volgende_munt <= 0) {
            munten[message.author.id].munten += 1;
            munten[message.author.id].volgende_munt += 5;
        }

        fs.writeFile(`./databases/munten/munten-${message.guild.id}.json`, JSON.stringify(munten), (err) => {
            if (err) console.log(err)
        });
    }
})

client.on("message", async message => {

    if (!blacklistedservers[message.guild.id]) {
        blacklistedservers[message.guild.id] = false;
        fs.writeFile(`./databases/blacklistedservers.json`, JSON.stringify(blacklistedservers), (err) => {
            if (err) console.log(err)
        });
    }

    if (fs.existsSync(`./databases/guild info/${message.guild.id}.json`)) {

    }
    else {
        fs.writeFileSync(`./databases/guild info/${message.guild.id}.json`, defaultJSON);
    }

    let guild_info = require(`./databases/guild info/${message.guild.id}.json`)

    if (!guild_info.prefix) {
        guild_info = {
            prefix: botconfig.defaultprefix
        }
    }

    fs.writeFile(`./databases/guild info/${message.guild.id}.json`, JSON.stringify(guild_info), (err) => {
        if (err) console.log(err)
    });

    const prefix = guild_info.prefix;

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    if (blacklistedservers[message.guild.id] === true && developers[message.author.id] != true) {
        return message.channel.send("This server is blacklisted!");
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) {
        command.run(client, message, args, dbl);
    }
});

client.on("error", async error => {
    console.log(error);
});


dbl.on('error', error => {
        console.log(`Er ging iets mis met top.gg! ${error}`);
})

client.login(process.env.TOKEN);