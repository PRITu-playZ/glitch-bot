require('dotenv').config();

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./src/bot/client.js', { token: process.env.TOKEN });
const server = require('./site/server.js')
server.listen(process.env.PORT || 8080)

manager.spawn();