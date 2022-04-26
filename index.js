const { Wechaty } = require('wechaty')
const { PuppetPadlocal } = require('wechaty-puppet-padlocal')
const { PUPPET_PADLOCAL_TOKEN, BOT_NAME } = require('./config')
const AutoReply = require('./plugin/auto-reply')
const messageSave = require('./plugin/message-save')


const {
  QRCodeTerminal,
  EventLogger
} = require('wechaty-plugin-contrib')
// const {onLogin} = require("../server/bot/lib/Login"); //官方插件
// 初始化
const bot = new Wechaty({
  puppet: new PuppetPadlocal({
    token: PUPPET_PADLOCAL_TOKEN,
  }),
  name: BOT_NAME,
})
//登录二维码
bot.use(QRCodeTerminal({ small: false }))
//日志输出
bot.use(EventLogger())
//关键词自动回复
bot.use(AutoReply({
    keywords: [{ keyword: 'test', content: '自动回复' }]
})
)
//消息存储
bot.use(messageSave())


bot.on('login', async (user)=>{
  global.bot = bot;
}).on('error', (error) => {
  console.error(error)
}).start()

