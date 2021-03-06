/*
 * @Desc:关键词自动回复
 * @Author: zwh
 * @Date: 2022-04-02 16:41:56
 * @LastEditors: zwh
 * @LastEditTime: 2022-04-02 17:11:07
 */
let DEFAULT_CONFIG = {
  unknownSay: "自动回复",
  keywords: [{ keyword: 'test', content: 'test' }]
}
module.exports = function AutoReply(config = {}) {
  DEFAULT_CONFIG = Object.assign(DEFAULT_CONFIG, config)
  return (bot) => {
    // 消息监听
    bot.on("message", async (msg) => {
      if (msg.self()) return
      console.log("=============================")
      let str = `msg : ${msg}`
      str += `    from: ${msg.from() ? msg.from().name() : 'null'}: ${msg.from() ? msg.from().id : 'null'
        }`
      console.log(str)
      // console.log(`to: ${msg.to()}`)
      // console.log(`text: ${msg.text()}`)
      // console.log(`isRoom: ${msg.room()}`)
      // console.log(`isRoomId: ${msg.room()?msg.room().id:null}`)
      // console.log("=============================")
      // 校验消息类型为文本
      if (msg.type() === bot.Message.Type.Text) {
        //取消回复群聊
        if (false&&msg.room()) { //来自群聊
          let room = await msg.room()
          if (await msg.mentionSelf()) { //@自己
            let self = await msg.from()
            self = '@' + self.name()
            let sendText = msg.text().replace(self, '')
            sendText = sendText.trim()
            // 获取需要回复的内容
            const content = _keyWordReply(sendText)
            room.say(content)
            return
          }
          //@成员或者没@人
          let sendText = msg.text()
          let person = false
          if (sendText.indexOf('@') == 0) {
            const str = sendText.replace('@', '').split(' ')
            if (!str[1]) return
            person = str[0].trim()
            sendText = str[1].trim()
          }
          let content = _keyWordReply(sendText)
          if (content) {
            if (person) {
              content = `@${person} ${content}`
            } else {
              content = `「${msg.from().name()}：${msg.text()}」\n- - - - - - - - - - - - - - -\n${content}`
            }
            room.say(content)
          }
        }
        //私聊
        const content = _keyWordReply(msg.text())
        if(content!==null){msg.say(content)}
        return
      }else {
        console.log(bot.Message)
      }
      console.log('不是文本消息，不处理')
    })
  }
}

function _keyWordReply(keyword) {
  const res = DEFAULT_CONFIG.keywords.find((v) => v.keyword == keyword)
  if (res) return res.content
  return null
  return DEFAULT_CONFIG.unknownSay
}
