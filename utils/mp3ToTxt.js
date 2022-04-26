/*
* Create by zhongwenhui on 2022/3/22
* */
/*********************************************************************************
 * @file: mp3ToTxt
 *  * 运行前：请先填写 appId、secretKey、filePath
 *  * 语音转写 WebAPI 接口调用示例
 *  * 语音转写 WebAPI 接口调用示例 接口文档（必看）：https://www.xfyun.cn/doc/asr/lfasr/API.html
 *  * 错误码链接：
 *  * https://www.xfyun.cn/document/error-code （code返回错误码时必看）
 * @ahthor: zhongwenhui
 * @usedate:2022/3/22
 **********************************************************************************/
const Nls = require("alibabacloud-nls")
const request = require('request');
let {accessKeyId,accessKeySecret,endpoint} = require('../config.js');
var RPCClient = require('@alicloud/pop-core').RPCClient;
var appkey = 'mbSHHwbJTagoWZDR';
var token = '';
var url = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr';
var audioFile = '';
var format = 'wav';
var sampleRate = '16000';
var enablePunctuationPrediction = true;
var enableInverseTextNormalization = true;
var enableVoiceDetection  = false;
var client = new RPCClient({
  accessKeyId,
  accessKeySecret,
  endpoint,
  apiVersion: '2019-02-28'
});

/**
 * 设置RESTful请求参数
 */
var requestUrl = url;
requestUrl = requestUrl + '?appkey=' + appkey;
requestUrl = requestUrl + '&format=' + format;
requestUrl = requestUrl + '&sample_rate=' + sampleRate;
if (enablePunctuationPrediction) {
  requestUrl = requestUrl + '&enable_punctuation_prediction=' + 'true';
}
if (enableInverseTextNormalization) {
  requestUrl = requestUrl + '&enable_inverse_text_normalization=' + 'true';
}
if (enableVoiceDetection) {
  requestUrl = requestUrl + '&enable_voice_detection=' + 'true';
}
module.exports = async (bufferData) =>{
  await client.request('CreateToken').then((result) => {
    token = result.Token.Id
  });
  /**
   * 设置HTTPS请求头部
   */
  var httpHeaders = {
    'X-NLS-Token': token,
    'Content-type': 'application/octet-stream',
    'Content-Length': bufferData.length
  };

  var options = {
    url: requestUrl,
    method: 'POST',
    headers: httpHeaders,
    body: bufferData
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body)=>{
      if (error != null) {
        console.log(error);
      }
      else {
        if (response.statusCode == 200) {
          body = JSON.parse(body);
          if (body.status == 20000000) {
            resolve(body.result)
          } else {
            reject(body)
          }
        } else {
          reject(body)
        }
      }
    });
  })

};
