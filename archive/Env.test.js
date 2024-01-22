import  {expect} from 'chai'
import {describe, it} from 'mocha'

import fs from 'fs'
import path from 'path'

import walkAndFindEnvFiles from '#projectRoot/src/archive/walkAndFindEnvFiles'

import {checkPathExists, createDirsAndFiles, getAbsPathOfDirName, getDirname, 
        getPackageJSONasObj, getScopeName, getTestDir} from '@ktr-utility/core_util'


import Env from '#projectRoot/src/archive/Env'


const testDir = await getTestDir()
const testDirTmp = path.join(testDir, 'tmp')


describe('Env', () => {
  let tmpPaths
  const path1 = testDirTmp
  const path2 = path.join(testDirTmp, 'test')
  const path3 = path.join(testDirTmp, 'test', 'test2')

  before(async () => {
      tmpPaths = [path.join(path1, '.env'), path.join(path2, '.env'), path.join(path3, '.env')]

      await createDirsAndFiles(tmpPaths)
  })

  it('should return .env file attributes prefixed with __ktr-srt__', async () => {
      const data1 = "__ktr-srt__hello=world"
      const data2 = "__ktr-srt__hello=world\n__ktr-srt__hello2=world2"
      const data3 = "__ktr-srt__hello=world\n__ktr-srt__hello2=world2\n__ktr-srt__hello3=world3"

      try {
        await fs.promises.writeFile(tmpPaths[0], data1)
        await fs.promises.writeFile(tmpPaths[1], data2)
        await fs.promises.writeFile(tmpPaths[2], data3)
      } catch (err) {
        console.error(err)
      }

      const env = new Env()
      await env.init(path3, path1, 'up', '__ktr-srt__')
      const res = env.flatten()
      console.log(res)
  });

  it('should return all .env file attributes since we are not using a prefix.', async () => {
      const data1 = "hello=world"
      const data2 = "hello=world\nhello2=world2"
      const data3 = "hello=world\nhello2=world2\nhello3=world3"

      try {
        await fs.promises.writeFile(tmpPaths[0], data1)
        await fs.promises.writeFile(tmpPaths[1], data2)
        await fs.promises.writeFile(tmpPaths[2], data3)
      } catch (err) {
        console.error(err)
      }

      const env = new Env()
      await env.init(path3, path1, 'up', '')
      const res = env.flatten()
      console.log(res)
  });

});