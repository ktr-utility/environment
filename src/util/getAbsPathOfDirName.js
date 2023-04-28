
import fs from 'fs'
import path from 'path'


/**
 * Gets the absolute path of a directory name by searching from a given path.
 *
 * @param {string} dirName - The name of the directory to search for.
 * @param {string} [startPath] - The optional starting path to search from. Defaults to the current directory.
 * @returns {string|null} - The absolute path of the directory, or null if not found.
 */
export default async function getAbsPathOfDirName(dirName, startPath = process.cwd()) {
  let currentPath = path.resolve(startPath);

  while (currentPath !== path.parse(currentPath).root) {
    const directoryPath = path.join(currentPath, dirName);

    try {
      // Check if the directory exists
      await fs.promises.access(directoryPath, fs.constants.F_OK | fs.constants.R_OK);

      // Check if it's a directory
      const stats = await fs.promises.stat(directoryPath);
      if (stats.isDirectory()) {
        return directoryPath;
      }
    } catch (err) {
      // Ignore errors and continue searching in the parent directory
    }

    // Move up to the parent directory
    currentPath = path.dirname(currentPath);
  }

  return null; // Directory not found
}