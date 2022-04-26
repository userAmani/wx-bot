/*
* Create by zhongwenhui on 2022/3/22
* */
/*********************************************************************************
 * @file: streamToBuffer
 * @desc:
 * 1,
 * @ahthor: zhongwenhui
 * @usedate:2022/3/22
 **********************************************************************************/
module.exports = async (stream) =>{
  return new Promise((resolve, reject) => {
    let buffers = []
    stream.on('error', reject)
    stream.on('data', (data) => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
};
