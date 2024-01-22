import path from 'path'

import {walkUpAndFindOne} from '@ktr-utility/core_util'


// walk up the directory tree and get env files along the way
export default async function walkAndFindEnvFiles(direction='up', startPath, endPath) {
  if (direction !== 'up' && direction !== 'down') throw new Error(`Invalid direction: ${direction}`)
  if (!startPath) throw new Error(`Invalid startPath: ${startPath}`)
  if (!endPath) throw new Error(`Invalid endPath: ${endPath}`)
  

  let currPath = startPath


  let envPaths = []

  while (true) {
    const envFile = await walkUpAndFindOne('.env', currPath, currPath)

    envPaths.push(envFile)

    if (currPath === endPath) return envPaths
    
    if (direction === 'up') {
      const res = await walkAndFindEnvFiles('up', path.resolve(currPath, '..'), endPath);

      return envPaths.concat(res);
    } 
    else if (direction === 'down') {

      let tail = endPath.split(startPath)[1]

      // Remove leading slash, if any
      const cleanedPath = tail.startsWith('/') ? tail.slice(1) : tail;

      const nextDir = cleanedPath.split('/')[0]

      const nextPath = path.resolve(startPath, nextDir)

      const res = await walkAndFindEnvFiles('down', nextPath, endPath)

      return envPaths.concat(res);
    }

  }
}