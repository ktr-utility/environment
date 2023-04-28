import dotenv from 'dotenv'

import {getScopeName, walkAndFindAll, walkAndFindOne} from '@ktr-srt/util'


export default class Env {
  constructor() {
    this.initialized = false
  }


  /**
   * @pararm {String} bottomDirPath - The dir to start searching for config files in if direction is 'up', 
   *  or the dir to stop searching for config files in if direction is 'down'
   * @param {String} scopeName - The name of the scope to search for config files in, ie @ktr-srt
   * @param {"up"|"down")} direction 
   */
  async init(bottomDirPath=process.cwd(), topDirPath, direction='up', prefix="__ktr-srt__") {
    if (!['up', 'down'].includes(direction)) throw new Error(`Invalid direction: ${direction}`)

    if (!topDirPath) {
      // check if 
    }

    this.topDirPath = topDirPath
    this.direction = direction

    let envFilePaths = undefined // []
    this.envarsObj = undefined // { 'envPath': { envars:{} } }


    const scopeName = await getScopeName()
    const scopePath = await walkAndFindOne(scopeName, bottomDirPath)

    envFilePaths = await walkAndFindAll('.env', bottomDirPath, scopePath)


    for (const envPath of envFilePaths) {

        dotenv.config({ "path": envPath })

        const envars = {}
        
        try {
          if (prefix) {
            for (const envar in process.env) {
              
              if (!envar.startsWith(prefix)) continue

              let tail = envar.split(prefix)[1]
              envars[tail] = process.env[envar]

              // delete because if we don't then workspace envars and project envars will be merged
              delete process.env[envar]
            }
          } else {
            for (const envar in process.env) {
              envars[envar] = process.env[envar]
              delete process.env[envar]
            }
          }
        } catch (err) {
            console.error(err)
            process.exit(1)
        }

        this.envarsObj[envPath] = envars

    }

    this.initialized = true
  }


  flatten(direction=this.direction) {
      let compareFilePaths

      if (direction === 'down') {
        compareFilePaths = (a, b) => {
          const slashesA = (a.match(/\//g) || []).length; // Count the number of slashes in A
          const slashesB = (b.match(/\//g) || []).length; // Count the number of slashes in B
          return slashesA - slashesB; // Compare based on the number of slashes
        };
      } else if (direction === 'up') {
        compareFilePaths = (a, b) => {
          const slashesA = (a.match(/\//g) || []).length; // Count the number of slashes in A
          const slashesB = (b.match(/\//g) || []).length; // Count the number of slashes in B
          return slashesB - slashesA; // Compare based on the number of slashes
        };
      }
      
      Object.values(this.envars).forEach(envar => {
          flattenedEnvars = { ...flattenedEnvars, ...envar }
      })

      const flattenedEnvars = filePaths.sort(compareFilePaths)

      return flattenedEnvars
  }
}