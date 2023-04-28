import dotenv from 'dotenv'

import {getScopeName, walkAndFindAll, walkAndFindOne} from '@ktr-srt/util'


/**
 * Walks in specified direction and loads environment variables from .env files.
 * @param {string} bottomDirPath 
 * @param {string} topDirPath 
 * @param {'up'|'down'} direction
 * @param {string} prefix
 * @param {boolean} walkToScope
 * @returns 
 */
export async function walkAndLoadEnv(
  bottomDirPath=process.cwd(), topDirPath, 
  { direction='up', prefix="__ktr-srt__", walkToScope=false }={},
  options={ pathKeySize:5 }
) {
  const { pathKeySize } = options

  if (!['up', 'down'].includes(direction)) throw new Error(`Invalid direction: ${direction}`)
  
  // topDirPath should be shorter, since it's closer to the root
  if (topDirPath.split('/').length > bottomDirPath.split('/').length) throw new Error(`topDirPath should be shorter than bottomDirPath`)

  if (walkToScope === true) {
      const scopeName = await getScopeName()
      const scopePath = await walkAndFindOne(scopeName, bottomDirPath)
      topDirPath = scopePath
  }
  if (!walkToScope && !topDirPath) topDirPath = bottomDirPath


  let envarsObj = {} // { 'envPath': { envars:{} } }

  let envFilePaths = await walkAndFindAll('.env', bottomDirPath, topDirPath)


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

      const key = envPath.split('/').slice(-pathKeySize).join('/')

      envarsObj[key] = {}
      envarsObj[key].path = envPath
      envarsObj[key].envars = envars
  }

  return { ...envarsObj,
    flatten: () => flatten(envarsObj, direction)
  }
}

/**
 * @template T
 * @param {{ envPath: { envars: T } }} envarsObj - An object with a property `envPath`
 *  containing an object with a property `envars`. 
 * @param {'up'|'down'} direction 
 * @returns {} environment variables 
 */
function flatten(envarsObj, direction) {
    let compareFilePaths_func

    if (direction === 'down') {
      compareFilePaths_func = (a, b) => {
        const slashesA = (a[1]['path'].match(/\//g) || []).length; // Count the number of slashes in A
        const slashesB = (b[1]['path'].match(/\//g) || []).length; // Count the number of slashes in B
        return slashesA - slashesB; // Compare based on the number of slashes
      };
    } else if (direction === 'up') {
      compareFilePaths_func = (a, b) => {
        const slashesA = (a[1]['path'].match(/\//g) || []).length; // Count the number of slashes in A
        const slashesB = (b[1]['path'].match(/\//g) || []).length; // Count the number of slashes in B
        return slashesB - slashesA; // Compare based on the number of slashes
      };
    }

    
    const orderedEnvarEntries = Object.entries(envarsObj).sort(compareFilePaths_func)
    const orderedEnvarObjs = orderedEnvarEntries.map(entry => entry[1]['envars'])

    let flattenedEnvars = {}

    for (let i = 0; i < orderedEnvarObjs.length; i++) {
        flattenedEnvars = {...flattenedEnvars, ...orderedEnvarObjs[i]}
    }


    return flattenedEnvars
}