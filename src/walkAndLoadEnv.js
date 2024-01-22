import dotenv from 'dotenv'

import {getScopeName, walkUpAndFindAll, walkUpAndFindOne} from '@ktr-utility/core_util'

import flatten from './flatten.js'


/**
 * Walks in specified direction and loads environment variables from .env files.
 *
 * @param {string} [bottomDirPath]
 * @param {string} [topDirPath]
 *
 * @param {Object} [{}]
 * @param {string} [{}.direction='up|down']
 * @param {string} [{}.varPrefix]
 * @param {boolean} [{}.walkToScope]
 *
 * @param {Object} [options={}]
 * @param {number} [options.pathKeySize]
 *
 * @returns {Object} [{}] An object containing loaded environment variables and a flatten function.
 * @return {number} [{}.envarsObj] An object containing loaded environment variables. // TODO 2024-01-20 Add this example to Anki.
 * @return {Function} [{}.flatten] A function that flattens the environment variables.
 */
export default async function walkAndLoadEnv(
  bottomDirPath=process.cwd(), topDirPath, 
  { direction='up', varPrefix="__ktr-srt__", walkToScope=false }={},
  options={ pathKeySize:5 }
) {
  const { pathKeySize } = options

  if (!['up', 'down'].includes(direction)) throw new Error(`Invalid direction: ${direction}`)

  if (walkToScope === true) {
      const scopeName = await getScopeName({})
      const scopePath = await walkUpAndFindOne(scopeName, bottomDirPath)
      topDirPath = scopePath
  }
  if (!walkToScope && !topDirPath) topDirPath = bottomDirPath

  // topDirPath should be shorter, since it's closer to the root
  if (topDirPath.split('/').length > bottomDirPath.split('/').length) throw new Error(`topDirPath should be shorter than bottomDirPath`)

  let envarsObj = {} // { 'envPath': { envars:{} } }

  let envFilePaths = await walkUpAndFindAll('.env', bottomDirPath, topDirPath)


  for (const envPath of envFilePaths) {
      dotenv.config({ "path": envPath })

      const envars = {}
      
      try {
        if (varPrefix) {
          for (const envar in process.env) {
            
            if (!envar.startsWith(varPrefix)) continue

            let tail = envar.split(varPrefix)[1]

            const row = process.env[envar]

            // strip out comments. Remove everything after a '#' character until newline
            let val = row.split('#')[0]

            val = val.trim()


            envars[tail] = val

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

      const key = envPath.split('/').slice(-pathKeySize).join('/')

      envarsObj[key] = {}
      envarsObj[key].path = envPath
      envarsObj[key].vars = envars
  }



  // TODO 2024-01-20 I think this is a bad idea? Then we are convoluting the return value. We are just stuffing the environment variables
  // together with a flatten function, having to return it, and then process it in order to flatten it.
  // Maybe it's better to return a new object with the environment variables object and the flatten function?
  // This keeps things separate.
  return { envarsObj,
    flatten: () => flatten(envarsObj, direction)
  }
}