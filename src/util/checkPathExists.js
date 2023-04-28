
import fs from 'fs'


export default function checkPathExists(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        // If an error occurs, the path does not exist
        if (err.code === 'ENOENT') {
          resolve(false); // Path does not exist
        } else {
          reject(err); // Other error occurred
        }
      } else {
        // If no error occurs, check if the path is a directory or a file
        resolve(stats.isDirectory() || stats.isFile());
      }
    });
  });
}