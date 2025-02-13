const mineflayer = require('mineflayer')
const socks = require('socks').SocksClient

if (process.argv.length < 9) {
  console.log('Usage: node socks5_proxy_example.js <proxy_ip> <proxy_port> <proxy_username> <proxy_password> <mc_server_address> <mc_server_port> <bot_username> [<bot_password>]')
  process.exit(1)
}

const PROXY_IP = process.argv[2]
const PROXY_PORT = parseInt(process.argv[3])
const PROXY_USERNAME = process.argv[4]
const PROXY_PASSWORD = process.argv[5]
const MC_SERVER_ADDRESS = process.argv[6]
const MC_SERVER_PORT = parseInt(process.argv[7])
const BOT_USERNAME = process.argv[8]
const BOT_PASSWORD = process.argv[9]

const bot = mineflayer.createBot({
  username: BOT_USERNAME,
  password: BOT_PASSWORD, // Optional, depending on if you need authentication for your account
  auth: 'microsoft', // or 'mojang' if you use a Mojang account, or 'offline' for servers without authentication
  checkTimeoutInterval: 120000, // Increase timeout interval to prevent disconnections due to lag
  connect: (client) => {
    socks.createConnection({
      proxy: {
        ipaddress: PROXY_IP, // Corrected: property 'ipaddress' instead of 'host'
        port: PROXY_PORT,
        type: 5,
        userId: PROXY_USERNAME,
        password: PROXY_PASSWORD
      },
      command: 'connect',
      destination: {
        host: MC_SERVER_ADDRESS,
        port: MC_SERVER_PORT
      }
    }, (err, info) => {
      if (err) {
        console.error('Proxy connection error', err)
        return
      }
      client.setSocket(info.socket)
      client.emit('connect')
    })
  },
  // fakeHost: MC_SERVER_ADDRESS // Optional, if the server rejects the proxy connection
})

bot.on('login', () => {
  console.log(`Bot ${bot.username} connected to ${MC_SERVER_ADDRESS}:${MC_SERVER_PORT} through proxy ${PROXY_IP}:${PROXY_PORT}`)
  bot.chat('Hello world from a SOCKS5 proxy!')
})

bot.on('kicked', (reason, loggedIn) => {
  console.log(`Bot was kicked from the server: ${reason} - Logged In: ${loggedIn}`)
})

bot.on('end', (reason) => {
  console.log(`Bot disconnected: ${reason}`)
})

bot.on('error', (err) => {
  console.log('Error', err)
})
