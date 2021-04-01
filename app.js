const Discord = require('discord.js')
const concierge = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const axios = require('axios')
const keepAlive = require('./server');
const prefix = '@'
require('dotenv').config()

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
} 

concierge.on('ready', () =>{
  concierge.user.setPresence({
      status: 'available',
      activity: {
          name: '@help', 
          type: 'WATCHING',
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
    if(!msg.member.hasPermission('ADMINISTRATOR'))
      return (
        msg.channel.send('Admin permission required 🤪'),
        await sleep(2000),
        msg.channel.bulkDelete(2)
      )
    const args = msg.content.slice(prefix.length).trim().split(' ')[1];
    const clear = async () => {
      await msg.channel.bulkDelete(args)
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
          .setTitle(`Weather for ${data.icao} - ${data.station.name}`)
          .setDescription(`${data.observed} \n **${data.raw_text}**`)
          .addFields(
              { name: `✅ Flight Rules: `, value: `${data.flight_category}`, inline: true },
              { name: `💨 Wind: `, value: `${data.wind.degrees}° ${data.wind.speed_kts} kts`, inline: true },
              { name: `🌡️ Temperature: `, value: `${data.temperature.celsius}° (${data.temperature.fahrenheit}°F)`, inline: true },
              { name: `💦 Dewpoint: `, value: `${data.dewpoint.celsius}° (${data.dewpoint.fahrenheit}°F)`, inline: true },
              { name: `🥵 Humidity: `, value: `${data.humidity.percent}%`, inline: true },
              { name: `🌀 QNH: `, value: `${data.barometer.hpa} hpa (${data.barometer.hg} hg)`, inline: true },
              { name: `☁️ Visibility: `, value: `${data.visibility.meters} miles (${data.visibility.miles} m)`, inline: true },
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

  //TAF command
  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'taf')){

    const args = msg.content.slice(prefix.length).trim().split(' ')[1]

    let data = []
    let data_forecast = []
    let clouds, weather
    var date_issued, date_from, date_too 
    const options = {
        headers: {'X-API-Key': process.env.TOKEN_WX}
    }
    
    axios.get(`https://api.checkwx.com/taf/${args}/decoded`, options)
      .then(resp => {
          data = resp.data.data[0]
          data_forecast = resp.data.data[0].forecast[0]
          date_issued = new Date(data.timestamp.issued)
          date_from = new Date(data.timestamp.from)
          date_to = new Date(data.timestamp.to)
      })
      .then(() => {
        const TafEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`TAF for ${data.icao} - ${data.station.name}`)
          .setDescription(`**Raw Text**\n${data.raw_text}\n`)
          .addFields(
              { name: `Observed at: `, value: `${date_issued.toUTCString()}`, inline: false },
              { name: `From: `, value: `${date_from.toUTCString()}`, inline: false },
              { name: `To: `, value: `${date_to.toUTCString()}`, inline: false },
              { name: `☁️ Visibility: `, value: `${data_forecast.visibility.meters} miles (${data_forecast.visibility.miles} miles)`, inline: true },
              { name: `💨 Wind`, value: `from ${data_forecast.wind.degrees}° at ${data_forecast.wind.speed_kts} kts`, inline: true  },
              { name: `☁️ Clouds`, value: `${data_forecast.clouds[0].text} at ${data_forecast.clouds[0].feet} ft AGL\n(Base at ${data_forecast.clouds[0].base_meters_agl} ft AGL)`, inline: false }
          )
          .setFooter('Powered by Pro Pulse Aviation Development Department & CheckWX', 'https://aviation.propulsegaming.com/loghi/logo.png')
        msg.channel.send(TafEmbed)   
      })
  }

  //Reaction message creation Command

  if(msg.content.toLocaleLowerCase().startsWith(prefix + 'reaction')){
    if(!msg.member.hasPermission('ADMINISTRATOR'))
      return (
        msg.channel.send('Admin permission required 🤪'),
        await sleep(2000),
        msg.channel.bulkDelete(2)
      )
    const ReactionEmbed = new Discord.MessageEmbed()
      .setDescription('🇺🇸 🇬🇧\nHello,\nWelcome to the PRO PULSE AVIATION Discord server. Please pay attention to the following information:')
      .addFields(
        {
          name: 'How can i get full access to the server?',
          value: `Due to our R&R, the Pro Pulse Aviation HQ decided to restrict the amount of power to the users without any role on this server.
          Therefore, it's mandatory to join the "Awaiting Approval" state by clicking on the reaction to this message., and to change your nickname with *NEW Name Surname*, in order to let Staff know that you're waiting for the welcome interview.
          Also write a very short presentation of yourself in the channel <#710407853986545685>, in order to introduce yourself to the company 🤗.
          After that, you will have to provide us with a date and time when you're available for the interview 😉.
          Once the interview is done, it will be assigned to you role to access the airline's channels in our discord.\n`
        },
        { 
          name: 'Discord Rules', 
          value: 'heck our discord rules in the <#710412636407332885>. Toxic Behaviours may lead to suspension and / or ban from the community!\n' 
        },
        { 
          name: 'Name', 
          value: `
            - Staff members must use: *Position Name Surname*
            - Pilots must use: *Name Surname Callsign*
            - Users must use: *Name Surname*\n
          ` 
        },
        { name: 'Our Website', value: `
                    Below you'll find the access link to the company's Smart Crew System (sCREW), where you can register if you haven't already done that!
            Your account will be activated after we have complited the welcome interview!
            https://aviation.propulsegaming.com/crew/index.php/registration` },
        {
          name: `Group Websites`,
          value: `
            - https://propulsegaming.com/
            - https://racing.propulsegaming.com/
            - https://aviation.propulsegaming.com/
          `
        },
        {
          name: `Group Socials`,
          value: `
            **Instagram**: https://www.instagram.com/propulsegaming
            **Facebook**: https://www.facebook.com/propulsegaming
            **YouTube**: https://www.youtube.com/propulsegaming
            **Twitch**: https://www.twitch.tv/propulsegamingtv
            \n
            For any further queries, do not hesitate to get in contact with
            <@&710405633765146625> <@&710406278488522782>
          `
        }

      )
      .setColor('#0099ff')
      .setFooter('Powered by Pro Pulse Aviation Development Department', 'https://aviation.propulsegaming.com/loghi/logo.png')

    const msgReaction = await msg.channel.send(ReactionEmbed)
    msgReaction.react(`764419064532566036`)
  }

})

concierge.on('messageReactionAdd', async (reaction, user) => {
  if(reaction.message.partial) await reaction.message.fetch()
  if(reaction.partial) await reaction.fetch()

  if(user.bot) return
  if(!reaction.message.guild) return

  if(reaction.message.channel.id === '826348638582079528'){
    if(reaction.emoji.id === `764419064532566036`){
        await reaction.message.guild.members.cache.get(user.id).roles.add('826347433076064256')
    }
  }
})

concierge.on('messageReactionRemove', async (reaction, user) =>{
  if(reaction.message.partial) await reaction.message.fetch()
  if(reaction.partial) await reaction.fetch()

  if(user.bot) return
  if(!reaction.message.guild) return

  if(reaction.message.channel.id === '826348638582079528'){
    if(reaction.emoji.id === `764419064532566036`){
        await reaction.message.guild.members.cache.get(user.id).roles.remove('826347433076064256')
    }
  }
})

keepAlive()
concierge.login(process.env.TOKEN_DISCORD)