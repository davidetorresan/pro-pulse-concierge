const Discord = require('discord.js')
const concierge = new Discord.Client()
const axios = require('axios')
require('dotenv').config()
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

concierge.on('message', msg => {

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
                msg.author.send(args)  
            })
    }

    //Charts Command

    if(msg.content.toLocaleLowerCase().startsWith(prefix + 'charts')){

        const args = msg.content.slice(prefix.length).trim().split(' ')[1]
        const link = `https://chartfox.org/${args}`

        msg.author.send(`Hi! \n You can found the charts for ${args} airport here! ${link} \n :warning: You need to log in with a vatsim account to view the cards :warning:`)
        
    }
})
concierge.login(process.env.TOKEN_DISCORD)