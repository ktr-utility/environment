import  {expect} from 'chai'
import {describe, it} from 'mocha'

import fs from 'fs'
import path from 'path'

import {getTestDir} from '@ktr-srt/util'

import {createDirsAndFiles} from '#util'

import {walkAndLoadEnv} from '#src/env'

const testDir = await getTestDir()
const testDirTmp = path.join(testDir, 'tmpA')


describe('Env', () => {
  const path0 = path.join(testDirTmp, 'tmpB', 'testC')
  const path1 = path.join(testDirTmp, 'tmpB')
  const path2 = testDirTmp

  const envPath0 = path.join(path0, '.env')
  const envPath1 = path.join(path1, '.env')
  const envPath2 = path.join(path2, '.env')

  before(async () => {
      await createDirsAndFiles([envPath0, envPath1, envPath2])
  })


  it('should return .env file attributes prefixed with __ktr-srt__', async () => {
      const data0 = "__ktr-srt__hello0=world0\n__ktr-srt__hello1=world1\n__ktr-srt__hello2=world2"
      const data1 = "__ktr-srt__hello0=world00\n__ktr-srt__hello1=world11"
      const data2 = "__ktr-srt__hello0=world000"

      try {
        await fs.promises.writeFile(envPath0, data0)
        await fs.promises.writeFile(envPath1, data1)
        await fs.promises.writeFile(envPath2, data2)
      } catch (err) {
        console.error(err)
      }

      let res = await walkAndLoadEnv(path0, path2, { direction: 'up', prefix: '__ktr-srt__' })
      res = res.flatten()

      expect(Object.keys(res)).to.have.lengthOf(3)
      expect(res).to.have.property('hello0', 'world000')
      expect(res).to.have.property('hello1', 'world11')
      expect(res).to.have.property('hello2', 'world2')
  })


  it('should return .env file attributes prefixed with __ktr-srt__', async () => {
      const data0 = "__ktr-srt__hello0=world0\n__ktr-srt__hello1=world1\n__ktr-srt__hello2=world2"
      const data1 = "__ktr-srt__hello0=world00\n__ktr-srt__hello1=world11"
      const data2 = "__ktr-srt__hello0=world000"

      try {
        await fs.promises.writeFile(envPath0, data0)
        await fs.promises.writeFile(envPath1, data1)
        await fs.promises.writeFile(envPath2, data2)
      } catch (err) {
        console.error(err)
      }

      let res = await walkAndLoadEnv(path0, path2, { direction: 'down', prefix: '__ktr-srt__' })
      res = res.flatten()

      expect(Object.keys(res)).to.have.lengthOf(3)
      expect(res).to.have.property('hello0', 'world0')
      expect(res).to.have.property('hello1', 'world1')
      expect(res).to.have.property('hello2', 'world2')
  })


  it('should return all .env file attributes since we are not using a prefix.', async () => {
      const data0 = "__ktr-srt__hello0=world0\n__ktr-srt__hello1=world1\n__ktr-srt__hello2=world2"
      const data1 = "__ktr-srt__hello0=world00\n__ktr-srt__hello1=world11"
      const data2 = "__ktr-srt__hello0=world000"

      try {
        await fs.promises.writeFile(envPath0, data0)
        await fs.promises.writeFile(envPath1, data1)
        await fs.promises.writeFile(envPath2, data2)
      } catch (err) {
        console.error(err)
      }

      let res = await walkAndLoadEnv(path0, path2, { direction: 'up', prefix: '', walkToScope: true })
      res = res.flatten()

      expect(Object.keys(res)).to.have.length.least(3)
      expect(res).to.have.property('__ktr-srt__hello0', 'world000')
      expect(res).to.have.property('__ktr-srt__hello1', 'world11')
      expect(res).to.have.property('__ktr-srt__hello2', 'world2')
  })

});