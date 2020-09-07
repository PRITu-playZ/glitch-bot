const path = require("path")
const Discord = require('discord.js');
const fs = require('fs');
const developers = require(path.resolve(`src/bot/databases/developers.json`));
const client = new Discord.Client({
    shards: 'auto',
    disableMentions: 'everyone'
});
const DBL = require('dblapi.js');
var dbl = new DBL(process.env.TOPAPI, { webhookPort: 5000, webhookAuth: "glitched" }, client);
const blacklistedservers = require(path.resolve(`src/bot/databases/blacklistedservers.json`));
module.exports = client;
var prefix = null;
var guild_info = null;
const defaultguildinfo = require(path.resolve(`src/bot/databases/defaultguildinfo.json`));

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

['command'].forEach(handler => {
    require(path.resolve(`src/bot/handlers/${handler}`))(client);
});

fs.readdir(path.resolve('src/bot/events/client/'), (err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(path.resolve(`src/bot/events/client/${file}`));
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(path.resolve(`src/bot/events/client/${file}`))];
    });
});

fs.readdir(path.resolve('src/bot/events/process/'), (err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(path.resolve(`src/bot/events/process/${file}`));
        let eventName = file.split('.')[0];
        process.on(eventName, event.bind(null, process));
        delete require.cache[require.resolve(path.resolve(`src/bot/events/process/${file}`))];
    });
});

fs.readdir(path.resolve('src/bot/events/dbl/'), (err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(path.resolve(`src/bot/events/dbl/${file}`));
        let eventName = file.split('.')[0];
        dbl.on(eventName, event.bind(null, dbl));
        delete require.cache[require.resolve(path.resolve(`src/bot/events/dbl/${file}`))];
    });
});

fs.readdir(path.resolve('src/bot/events/dbl-webhook/'), (err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(path.resolve(`src/bot/events/dbl-webhook/${file}`));
        let eventName = file.split('.')[0];
        dbl.webhook.on(eventName, event.bind(null, dbl.webhook));
        delete require.cache[require.resolve(path.resolve(`src/bot/events/dbl-webhook/${file}`))];
    });
});

client.on('message', async message => {

    if (!message.guild) return;

    if (!message.member) return;

    if (fs.existsSync(path.resolve(`src/bot/databases/guild info/${message.guild.id}.json`)) != true) {
        fs.writeFileSync(
            path.resolve(`src/bot/databases/blacklistedservers.json`),
            "{}", function(err) {
                if (err) console.log('error', err);
            });
    }

    if (!blacklistedservers[message.guild.id]) {
        blacklistedservers[message.guild.id] = false;
        fs.writeFile(
            path.resolve(`src/bot/databases/blacklistedservers.json`),
            JSON.stringify(blacklistedservers), function(err) {
                if (err) console.log('error', err);
            });
    }

    if (fs.existsSync(path.resolve(`src/bot/databases/guild info/${message.guild.id}.json`)) != true) {
        fs.writeFileSync(
            path.resolve(`src/bot/databases/guild info/${message.guild.id}.json`),
            JSON.stringify(defaultguildinfo), function(err) {
                if (err) console.log('error', err);
            });
    }

    if (fs.existsSync(path.resolve(`src/bot/databases/xp/xp-${message.guild.id}.json`)) != true) {
        fs.writeFileSync(
            path.resolve(`src/bot/databases/xp/xp-${message.guild.id}.json`),
            "{}", function(err) {
                if (err) console.log('error', err);
            });
    }

    if (fs.existsSync(path.resolve(`src/bot/databases/coins/coins-${message.guild.id}.json`)) != true) {
        fs.writeFileSync(
            path.resolve(`src/bot/databases/coins/coins-${message.guild.id}.json`),
            "{}", function(err) {
                if (err) console.log('error', err);
            });
    }

    guild_info = require(path.resolve(`src/bot/databases/guild info/${message.guild.id}.json`));

    if (!guild_info.prefix) {
        guild_info = {
            prefix: process.env.PREFIX
        };
    }

    fs.writeFile(
        path.resolve(`src/bot/databases/guild info/${message.guild.id}.json`),
        JSON.stringify(guild_info), function(err) {
            if (err) console.log('error', err);
        });

    prefix = guild_info.prefix;

    if (message.author.bot) return;
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;
    if (!message.member)
        message.member = await message.guild.fetchMember(message);

    if (
        blacklistedservers[message.guild.id] === true &&
        developers[message.author.id] !== true
    ) {
        return message.channel.send('This server is blacklisted!');
    }

    client.emit("command", message, guild_info);

});

client.login(process.env.TOKEN);

module.exports = client;