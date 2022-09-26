import fs from "fs";
import { basename, relative, resolve } from "path";

import yaml from "yaml";

const destination = "/Volumes/JOELLEMUSIC/ITUNES_SYNC";

(async function main() {
  if (!fs.existsSync(destination)) {
    await fs.promises.mkdir(destination);
    console.log(`CREATED\t${destination}`);
  }

  const itunesPlaylists: {
    [playlistName: string]: string[];
  } = yaml.parse(
    await fs.promises.readFile("itunes-state.yaml", {
      encoding: "utf-8",
    })
  );

  await deleteUnexpectedFiles(
    destination,
    Object.keys(itunesPlaylists).map((p) => sanitise(p))
  );

  for (let playlistName in itunesPlaylists) {
    // TODO: Delete playlists that shouldn't exist

    const playlistPath = resolve(destination, sanitise(playlistName));

    if (!fs.existsSync(playlistPath)) {
      await fs.promises.mkdir(playlistPath);
      console.log(`CREATED\t${playlistPath}`);
    }

    const originalFiles = itunesPlaylists[playlistName];
    if (!originalFiles || !originalFiles.length) {
      //console.log(
      //`Skipping playlist ${JSON.stringify(
      //playlistName
      //)} because it has no tracks`
      //);
      continue;
    }

    await deleteUnexpectedFiles(
      playlistPath,
      originalFiles.map((file) => basename(file))
    );

    const existingFiles = await fs.promises.readdir(playlistPath);
    for (let srcPath of originalFiles) {
      let filename = basename(srcPath);
      if (!existingFiles.includes(filename)) {
        const destPath = resolve(playlistPath, filename);
        await fs.promises.copyFile(srcPath, destPath);
        console.log(`ADDED\t${relative(destination, destPath)}`);
      }
    }
  }
})();

async function deleteUnexpectedFiles(
  directory: string,
  expectedFiles: string[]
) {
  let files = await fs.promises.readdir(directory);
  const toDelete = files.filter((file) => !expectedFiles.includes(file));

  if (toDelete.length)
    for (let file of toDelete) {
      const path = resolve(directory, file);
      await fs.promises.rm(path, { recursive: true, force: true });
      console.log(`DELETED\t${relative(destination, path)}`);
    }
}

function sanitise(filename: string) {
  return filename.replace(/\//g, "_");
}
