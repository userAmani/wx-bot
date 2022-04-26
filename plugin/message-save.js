/*
* Create by zhongwenhui on 2022/3/17
* */
/*********************************************************************************
 * @file: message-save
 * @desc:
 * 1,
 * @ahthor: zhongwenhui
 * @usedate:2022/3/17
 **********************************************************************************/
let qn = require('../plugin/qiniu/qiniuPush');
const { FileBox,UrlLink } = require('wechaty')
const axios = require('axios')
let { writeFile } =  require('fs/promises');
const mp3ToTxt = require('../utils/mp3ToTxt')
const silkToMp3 = require('../utils/silkToMp3')
const mkdir = require('../utils/mkdir')
let stream =  require('stream');
var fs = require('fs');
const targetPath = './temp/admin';

const PassThrough = stream.PassThrough;
module.exports = function messageSave(config = {}) {
  return (bot) => {
    // 消息监听
    bot.on("message", async (message) => {
      const room = message.room();
      const roomTopic = room ? await room.topic() : null;
      const contact = message.from();
      const contactName = contact ? contact.name() : null;
      let savePath = `${targetPath}/${roomTopic||contactName}${roomTopic?('/'+contactName):''}`;
      if (fs.existsSync(savePath)) {
        console.log('该路径已存在'+savePath);
      }else{
        console.log('该路径不存在'+savePath);
        try {
          await mkdir(savePath);
        } catch (e) {
          throw Error(e.msg);
        }
      }
      switch (message.type()) {
        // 文本消息
        case bot.Message.Type.Text:
          const text = message.text();
          console.log(`[${contactName}]说:${text}`);
          // 所有联系人列表中，包含了聊天室中哪些不认识联系人

          // const allContactList = await bot.Contact.findAll();
// 获取你添加过的好友。和微信一样，不知道对方是否删除了你
//           const friendList = allContactList.filter(contact => contact.friend());
          break;

        // 图片消息(七牛)
        case bot.Message.Type.Image:
          const messageImage = await message.toImage();

          // 缩略图
          const thumbImage = await messageImage.thumbnail();
          const thumbImageData = await thumbImage.toBase64();
          // thumbImageData: 缩略图图片二进制数据

          // 大图
          const hdImage = await messageImage.hd();
          const hdImageData = await hdImage.toBase64();
          // 大图图片二进制数据

          // 原图
          const artworkImage = await messageImage.artwork();
          const artworkImageData = await artworkImage.toBase64();
          // artworkImageData: 原图图片二进制数据
          // console.log((artworkImageData||hdImageData||thumbImageData).toString('base64'))

          let Buffer64 = new Buffer.from((artworkImageData||hdImageData||thumbImageData), 'base64');
          let imageName = savePath+'/'+new Date().getTime()+'test.jpg';
          console.log('保存位置',imageName)

          await writeFile(imageName, Buffer64, async function(err) {
            if (err) {
              return console.error(err);
            }
            console.log("数据写入成功！");
            return ;
          });
          // qn.upBuffer({
          //   file: Buffer64,
          //   name: imageName,
          //   communicationId: ''
          // })
          break;

        // 链接卡片消息
        case bot.Message.Type.Url:
          const urlLink = await message.toUrlLink();
          // urlLink: 链接主要数据：包括 title，URL，description

          const urlThumbImage = await message.toFileBox();
          const urlThumbImageData = await urlThumbImage.toBuffer();
          // urlThumbImageData: 链接的缩略图二进制数据

          break;

        // 小程序卡片消息
        case bot.Message.Type.MiniProgram:
          const miniProgram = await message.toMiniProgram();
          /*
          miniProgram: 小程序卡片数据
          {
            appid: "wx363a...",
            description: "贝壳找房 - 真房源",
            title: "美国白宫，10室8厅9卫，99999刀/月",
            iconUrl: "http://mmbiz.qpic.cn/mmbiz_png/.../640?wx_fmt=png&wxfrom=200",
            pagePath: "pages/home/home.html...",
            shareId: "0_wx363afd5a1384b770_..._1615104758_0",
            thumbKey: "84db921169862291...",
            thumbUrl: "3051020100044a304802010002046296f57502033d14...",
            username: "gh_8a51...@app"
          }
         */
          break;

        // 语音消息
        case bot.Message.Type.Audio:
          const audioFileBox = await message.toFileBox();

          const audioData = await audioFileBox.toBuffer();
          let fileName = savePath+'/'+audioFileBox.name;
          await writeFile(fileName, audioData, async function(err) {
            if (err) {
              return console.error(err);
            }
            console.log("数据写入成功！");
          });
          //silk 转 wav
          let file = await silkToMp3(fileName,fileName+'.wav','wav');
          // 保存文件
          await writeFile(fileName+'.wav', file);
          //转换文字
          let mp3ToTxtData = await mp3ToTxt(file);
          console.log('语音识别',mp3ToTxtData)

          // audioData: silk 格式的语音文件二进制数据

          break;

        // 视频消息(七牛)
        case bot.Message.Type.Video:
          const videoFileBox = await message.toFileBox();

          const videoData = await videoFileBox.toBuffer();
          // videoData: 视频文件二进制数据
          let videoName = savePath+'/'+videoFileBox.name;
          await writeFile(videoName, videoData, async function(err) {
            if (err) {
              return console.error(err);
            }
            console.log("数据写入成功！");
            return ;
          });
          await qn.upBuffer({
            file: videoData,
            name: videoName,
            communicationId: ''
          })
          break;

        // 动图表情消息
        case bot.Message.Type.Emoticon:
          const emotionFile = await message.toFileBox();

          const emotionData = await emotionFile.toBuffer();
          // emotionData: 动图 Gif文件 二进制数据

          break;

        // 文件消息(七牛)
        case bot.Message.Type.Attachment:
          const attachFileBox = await message.toFileBox();

          const attachData = await attachFileBox.toBuffer();
          // attachData: 文件二进制数据

          let attachName = savePath+'/'+attachFileBox.name;
          await writeFile(attachName, attachData, async function(err) {
            if (err) {
              return console.error(err);
            }
            return ;
          });
          await qn.upBuffer({
            file: attachData,
            name: attachName,
            communicationId: ''
          })
          break;

        // 其他消息
        default:
          break;
      }
    })
  }
}
