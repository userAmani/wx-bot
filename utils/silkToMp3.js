/*
* Create by zhongwenhui on 2022/3/21
* */
/*********************************************************************************
 * @file: silkToMp3
 * @desc:
 * 1,
 * @ahthor: zhongwenhui
 * @usedate:2022/3/21
 **********************************************************************************/
// 初始化
const ffmpegPath = "./utils/ffmpeg";
var fs = require('fs');
const WxVoice = require('wx-voice');
var detectPlatform = function (url) {
  switch (process.platform) {
    case "darwin": //unix 系统内核
      console.log('darwin ');
      return "darwin";
      break;
    case "win32": //windows 系统内核
      console.log('win32');
      return "win32";
      break;
    case "linux": //linux 系统内核
      console.log('linux');
      return "linux";
      break;
  }
};
var voice = new WxVoice(undefined, detectPlatform()=="darwin"?ffmpegPath:'ffmpeg');
module.exports = function (input = null, output = null, format = "mp3") {
  return new Promise((resolve, reject) => {
    // 错误处理
    voice.on("error", (err) => reject(err));

    // 从 silk 解码至 MP3
    voice.decode(
      input, output, {format: format,bitrate: '16',frequency:'16000'},
      (file) => {
        fs.readFile(output,(err,data)=>{
          if(err){
            reject(err);
            throw err;
          }
          console.log(data);
          resolve(data)
        });
      });
  })
}
