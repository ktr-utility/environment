/**
 * @template T
 * @param {{ envPath: { envars: T } }} envarsObj - An object with a property `envPath`
 *  containing an object with a property `envars`. 
 * @param {'up'|'down'} direction 
 * @returns {} environment variables 
 */
export default function flatten(envarsObj, direction) {
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
    const orderedEnvarObjs = orderedEnvarEntries.map(entry => {
      return entry[1]['vars']
    })

    let flattenedEnvars = {}

    for (let i = 0; i < orderedEnvarObjs.length; i++) {
        flattenedEnvars = {...flattenedEnvars, ...orderedEnvarObjs[i]}
    }


    return flattenedEnvars
}