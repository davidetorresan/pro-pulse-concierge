const Discord = require('discord.js')
const concierge = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const axios = require('axios')
const keepAlive = require('./server');
const prefix = '@'

concierge.on('ready', () =>{
  concierge.user.setPresence({
      status: 'available',
      activity: {
          name: '@help',
          type: 'WATCHING'
      }
  })
  console.log(`Logged in as ${concierge.user.tag}`)
}) 

concierge.on('message', async msg => {

  //Help Bot
  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'help')){
    const helpEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('There are all my commands')
      .setDescription('All you can need to take off')
      .addFields(
        {name: '@weather <ICAO>', value: 'This show you the last weather information of the airport'},
        {name: '@charts <ICAO>', value: 'This send you the aeronautical charts link of the airport'}
      )
      .setFooter('Powered by Pro Pulse Aviation Development Department', 'https://aviation.propulsegaming.com/loghi/logo.png')
    msg.channel.send(helpEmbed)
  }
  //Clear chat command

  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'clear')){
      const clear = async () => {
          let number = 100;
          while (number == 100) {
              await msg.channel.bulkDelete(100)
                  .then(messages => number = messages.size)
                  .catch(console.error);
          }    
      }
      clear()
  }

  //Weather command

  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'weather')){

    const args = msg.content.slice(prefix.length).trim().split(' ')[1];

    let data = [];

    const options = {
        headers: {'X-API-Key': process.env.TOKEN_WX}
    };
    
    axios.get(`https://api.checkwx.com/metar/${args}/decoded`, options)
      .then(resp => {
          data = resp.data.data[0]
      })
      .then(() => {
        const WeatherEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`Weather for ${data.icao}`)
          .setDescription(`${data.observed}`)
          .addFields(
              { name: `✅ Flight Rules: `, value: `${data.flight_category}`, inline: true },
              { name: `💨 Wind: `, value: `${data.wind.degrees}° ${data.wind.speed_kts} kts`, inline: true },
              { name: `🌡️ Temperature: `, value: `${data.temperature.celsius}° (${data.temperature.fahrenheit}°F)`, inline: true },
              { name: `💦 Dewpoint: `, value: `${data.dewpoint.celsius}° (${data.dewpoint.fahrenheit}°F)`, inline: true },
              { name: `🥵 Humidity: `, value: `${data.humidity.percent}%`, inline: true },
              { name: `🌀 QNH: `, value: `${data.barometer.hpa} hpa (${data.barometer.hg} hg)`, inline: true },
          )
          .setFooter('Powered by Pro Pulse Aviation Development Department & CheckWX', 'https://aviation.propulsegaming.com/loghi/logo.png');
        msg.channel.send(WeatherEmbed)   
      })
  }

  //Charts Command

  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'charts')){

      const args = msg.content.slice(prefix.length).trim().split(' ')[1]
      const link = `https://chartfox.org/${args}`

        msg.author.send(`Hi!\nYou can found the charts for ${args} airport here! ${link}\n:warning: You need to log in with a vatsim account to view the charts :warning:`)
        msg.reply(`The ${args} charts are sent in DM!`)
        
    }

    //Charts Command

    if(msg.content.toLocaleLowerCase().startsWith(prefix + 'charts')){

        const args = msg.content.slice(prefix.length).trim().split(' ')[1]
        const link = `https://chartfox.org/${args}`

        msg.author.send(`Hi!\nYou can found the charts for ${args} airport here! ${link}\n:warning: You need to log in with a vatsim account to view the charts :warning:`)
        msg.reply(`The ${args} charts are sent in DM!`)
        
    }

    //Reaction message creation Command

    if(msg.content.toLocaleLowerCase().startsWith(prefix + 'reaction')){

        const ReactionEmbed = new Discord.MessageEmbed()
            .setTitle('Welcome into Pro Pulse Aviation Discord Server!')
            .setDescription('Hi! \n Welcome to Pro Pulse Aviation (a Pro Pulse Gaming A.S.D. project) Discord server. Pleasy Pay attention to the following informations:')
            .addFields(
              { name: 'How can i get full access to the server?', value: 'Due our R&R, the Pro Pulse Aviation HQ decided to recstrict the amount of power to the users without any roles on this server. Therefore it is mandatory to join the Awaiting Approval state by clicking on the *reaction to this message*'},
              { name: 'Discord Rules', value: 'Check our discord rules in the #regulation channel. Behaviours may lead to suspension and / or ban from community.' },
              { name: 'Name', value: '- Staff members must use *Name Surname* \n - Users must use *Name Surname*' },
              { name: 'Our Website', value: 'Below you will find the access link to our Aviation website, where you can register if you have not already done that.' }

            )
            .setColor('#0099ff')
            .setFooter('Powered by Pro Pulse Aviation Development Department', 'https://aviation.propulsegaming.com/loghi/logo.png')

        const msgReaction = await msg.channel.send(ReactionEmbed)
        msgReaction.react('👌')
    }
})

concierge.on('messageReactionAdd', async (reaction, user) =>{
    if(reaction.message.partial) await reaction.message.fetch()
    if(reaction.partial) await reaction.fetch()

    if(user.bot) return
    if(!reaction.message.guild) return

    if(reaction.message.channel.id === '815144459322523649'){
        if(reaction.emoji.name === '👌'){
            await reaction.message.guild.members.cache.get(user.id).roles.add('779804041869131796')
        }
    }
})

concierge.on('messageReactionRemove', async (reaction, user) =>{
    if(reaction.message.partial) await reaction.message.fetch()
    if(reaction.partial) await reaction.fetch()

    if(user.bot) return
    if(!reaction.message.guild) return

    if(reaction.message.channel.id === '815144459322523649'){
        if(reaction.emoji.name === '👌'){
            await reaction.message.guild.members.cache.get(user.id).roles.remove('779804041869131796')
        }
    }
})

keepAlive()
concierge.login(process.env.TOKEN_DISCORD)