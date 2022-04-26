/*
* Create by zhongwenhui on 2020/5/5
* */
let qiniu = require('qiniu');
let formidable = require('formidable');
let fs = require('fs');
let config = require('../../config.js');

let qn = {};

//要上传的空间
let bucket = config.bucket;   //七牛云存储的存储空间名
const hostPath = config.url;
var accessKey = config.accessKey;
var secretKey = config.secretKey;
//构建上传策略函数   （获取七牛上传token）
qn.uptoken = function(bucket) {
    var putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
    var accessKey = config.accessKey;
    var secretKey = config.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var uploadToken=putPolicy.uploadToken(mac);
    return uploadToken;
}

qn.upBuffer = function(req,callback){

  return new Promise((resolve, reject) => {
    //上传到七牛后保存的文件名
    let key = 'weixin_'+req.communicationId+'_'+(req.name);
    //生成上传 Token
    let token = qn.uptoken(bucket);
    //构造上传函数
    // 文件上传（以下四行代码都是七牛上传文件的配置设置）
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2;  //设置传输机房的位置根据自己的设置选择
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    formUploader.put(token, key, req.file, putExtra, function(respErr,respBody, respInfo) {
      if (respErr) {
        reject()
        throw respErr;
      }
      if (respInfo.statusCode == 200) {//上传成功
        var response = {
          "url": hostPath+key
        };
        console.log('上传七牛Buffer：'+hostPath+key)
        resolve({response,respInfo})
      } else {//上传失败
        console.log(respInfo.statusCode);
      }
    });
  })
}
qn.deleteImg = function(imgName){
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    //config.useHttpsDomain = true;
    config.zone = qiniu.zone.Zone_z2;
    var bucketManager = new qiniu.rs.BucketManager(mac, config);
    console.log('imgName'+imgName)
    bucketManager.delete(bucket, imgName, function(err, respBody, respInfo) {
        if (err) {
            console.log(err);
            //throw err;
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
}
// console.log(qn.uptoken(bucket));

module.exports = qn;
