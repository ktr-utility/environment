import  {expect} from 'chai'
import {describe, it} from 'mocha'

import fs from 'fs'
import path from 'path'

import walkAndFindEnvFiles from '#projectRoot/src/archive/walkAndFindEnvFiles'

import {checkPathExists, createDirsAndFiles, getAbsPathOfDirName, getDirname, 
        getPackageJSONasObj, getScopeName, getTestDir} from '@ktr-utility/core_util'



const testDir = await getTestDir()
const testDirTmp = path.join(testDir, 'tmp')


describe('walkAndFindEnvPaths', () => {
  let tmpPaths

  before(async () => {
      tmpPaths = [ path.join(testDirTmp, '.env') ]
      await createDirsAndFiles(tmpPaths)

      const data1 = {
        "hello": "world"
      }

      try {
        await fs.promises.writeFile(tmpPaths[0], JSON.stringify(data1))
      } catch (err) {
        console.error(err)
      }
  });


  it('should return .env file attributes', async () => {
    let res = await checkPathExists(tmpPaths[0]);
    expect(res).to.be.true;

    const scopeName = '@ktr-srt'
    const scopePath = await getAbsPathOfDirName(scopeName)

    let envFiles = await walkAndFindEnvFiles('up', testDirTmp, testDirTmp)

    expect(envFiles).to.be.an('array').that.is.not.empty;
    expect(envFiles.length).to.equal(1)
  });

});