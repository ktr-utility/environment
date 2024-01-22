import walkAndLoadEnv from "./walkAndLoadEnv.js"


/**
 * Wrapper, to run walkAndLoad() and flatten the result.
 *
 * @param {string} [bottomDirPath] 
 * @param {string} [topDirPath] 
 *
 * @param {Object} [{}={}]
 * @param {string} [{}.direction='up|down'] 
 * @param {string} [{}.varPrefix] 
 * @param {boolean} [{}.walkToScope]
 *
 * @param {Object} [options={}]
 * @param {number} [options.pathKeySize]
 *
 * @returns {Object} [envars]
 */
export default async function walkLoadAndFlattenEnv(
  bottomDirPath=process.cwd(), topDirPath, 
  { direction='up', varPrefix="__ktr-srt__", walkToScope=false }={},
  options={ pathKeySize:5 }
) {

    const envarsObj = await walkAndLoadEnv(bottomDirPath, topDirPath, { direction, varPrefix, walkToScope }, options)
    const envars = envarsObj.flatten()
    

    return envars
}