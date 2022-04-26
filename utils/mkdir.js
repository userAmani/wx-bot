/*
* Create by zhongwenhui on 2022/4/12
* */
/*********************************************************************************
 * @file: mkdir
 * @desc:
 * 1,
 * @ahthor: zhongwenhui
 * @usedate:2022/4/12
 **********************************************************************************/
const fs = require('fs')
const path = require('path')
module.exports = async(reaPath)=> {
  const absPath = path.resolve(reaPath);
  try {
    await fs.promises.stat(absPath)
  } catch (e) {
    // 不存在文件夹，直接创建 {recursive: true} 这个配置项是配置自动创建多个文件夹
    await fs.promises.mkdir(absPath, {recursive: true})
  }
}
