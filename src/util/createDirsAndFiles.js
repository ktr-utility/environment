
import fs from 'fs'
import path from 'path'

import {getDirname} from '@ktr-srt/util'


/**
 * Create directories and files recursively for the given file paths.
 * If a path has no extension or ends with a '/', it's considered a directory,
 * otherwise, it's considered a file.
 * @param {string[]} paths - Array of file paths to create.
 * @returns {Promise<string[]>} - Promise that resolves to an array of created paths.
 * @throws {Error} - If there's an error during file or directory creation.
 */
export default async function createDirsAndFiles(paths) {
  const createdPaths = [];

  /**
   * Recursively create a directory or file for the given file path.
   * @param {string} filePath - The file path to create.
   * @returns {Promise<void>} - A promise that resolves when the file or directory is created.
   */
  // function createRecursive(filePath) {
  //   const normalizedPath = path.normalize(filePath);
  //   const hasExtension = path.extname(normalizedPath) !== '';
  //   const isDirectory = !hasExtension || normalizedPath.endsWith('/');
  //   const isFile = !isDirectory;

  //   return new Promise((resolve, reject) => {
  //       // Check if it already exists
  //       const stats = fs.existsSync(normalizedPath) && fs.statSync(normalizedPath);
  //       if (!stats) { // file or dir doesn't exist, create it recursively
  //           try {
  //               if (isDirectory) fs.mkdirSync(normalizedPath, { recursive: true });
  //               else if (isFile) fs.writeFileSync(normalizedPath, '');
  //               createdPaths.push(normalizedPath);
  //           } catch (err) {
  //               throw err;
  //           }
  //       }
  //   })
  // }

  function createRecursive(filePath) {
      const normalizedPath = path.normalize(filePath);
      const tail = path.basename(normalizedPath);
      const hasExtension = path.extname(normalizedPath) !== '';

      // if it has a file extension, or if it's a .env file, it's a file
      const isDirectory = (!hasExtension && !tail.startsWith('.env')) || normalizedPath.endsWith('/');
      const isFile = !isDirectory;


      return new Promise(async (resolve, reject) => {
          try {
              // Check if it already exists
              const stats = await fs.promises.stat(normalizedPath);
              resolve(`Already exists: ${filePath}`);
          } catch (err) {
              // File or directory doesn't exist, create it recursively
              if (isDirectory) {
                  try {
                      await fs.promises.mkdir(normalizedPath, { recursive: true });
                  } catch (err) {
                      reject(err);
                  }
              } else if (isFile) {
                  try {
                      // await fs.promises.writeFile(normalizedPath, '');

                      // fs.mkdir(normalizedPath, { recursive: true}, function (err) {
                      //   if (err) return cb(err);

                      //   fs.promises.writeFile(normalizedPath, '', cb);
                      // });

                      let res = await fs.promises.mkdir(path.dirname(normalizedPath), { recursive: true })

                      await fs.promises.writeFile(normalizedPath, '')

                  } catch (err) {
                      reject(err);
                  }
              }
              createdPaths.push(normalizedPath);
              resolve(`Created: ${filePath}`);
          }
      });
  }


  return Promise.all(paths.map(path => createRecursive(path)))
    .then((res) => {
      res.forEach((msg) => console.log(msg))
      return createdPaths
    });
}