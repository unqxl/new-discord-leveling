import Leveling from 'new-discord-leveling'; // [Importing Module]
const leveling = new Leveling({
  type: 'json', // [It also can be 'mongodb']
  jsonPath: './db.json', // [For 'json' type. Must be end with '.json'!]
  mongoPath: 'mongodb://localhost' // [For 'mongodb' type]
}); // [Initalize Module]

// [Discord Part]
import { Client, Intents } from 'discord.js'; // [Importing Discord.JS]
const client = new Client({
  ws: {
    intents: Intents.ALL
  }
}); // [Initalize Client]

// [Client Events]
client.once('ready', () => {
  return console.log(`${client.user.tag} is ready!`);
});

client.on('message', (msg) => {
  if(!msg.guild || !msg.guild.available) return;
  if(!msg.author.bot) return;
  
  const randomXP = Math.ceil(Math.random() * 11) + 1; // [Generating Random Number for XP]
  
  leveling.addXP(msg.author.id, msg.guild.id, Number(randomXP)); // [Adding XP]
  
  const args = message.content.slice('?'.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  
  if(command === 'ping') {
    return message.channel.send(`🏓 Pong!\n${client.ws.ping} ms!`);
  };
});

// [Module Events | Will write 'newLevel' event]
leveling.on('newLevel', (data) => {
  const guild = client.guilds.cache.get(data.guildID); // [Getting Guild from Data]
  const channel = guild.channels.cache.get('id') // [Replace 'id' with Channel ID]
  const member = guild.members.cache.get(data.userID) // [Getting Member from Data]
  
  return channel.send(`${member} reached **${data.level} level**!`);
});

// [Running Client]
client.login('bottoken') // [https://discord.com/developers/applications]
