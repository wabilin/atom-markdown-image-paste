'use babel';

import { clipboard } from 'electron'
import fs from 'fs'
import path from 'path'

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-markdown-image-paste:paste': () => this.paste()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  paste () {
    const customPath = atom.config.get( "atom-markdown-image-paste.savePath") || 'image';
    const relativePath = atom.config.get( "atom-markdown-image-paste.relativePath") || './';
    const mdPathPrefix = atom.config.get( "atom-markdown-image-paste.mdPathPrefix") || '';
    const editor = atom.workspace.getActiveTextEditor()
    if(!editor){
      return
    }
    const img = clipboard.readImage()
    if(img.isEmpty()){
      return
    }
    const documentTitle = editor.getTitle().split('.').slice(0, -1).join('.')
    const docDirName = documentTitle.replace(/[^a-zA-Z0-9-]/g,'_');
    const subDirectory = path.join(customPath, docDirName)
    const uid = getUid()
    const imageFilename = uid + ".png"
    const currentPath = editor.getPath()
    const subDirectoryPath = path.join(currentPath, '../', relativePath, subDirectory)
    const imagePath = path.join(subDirectoryPath, imageFilename)
    const insertedImagePath = path.join(mdPathPrefix, subDirectory, imageFilename)

    if (!fs.existsSync(subDirectoryPath)){
    fs.mkdirSync(subDirectoryPath);
    }
    fs.writeFileSync(imagePath, img.toPNG())
    editor.insertText(`![](${insertedImagePath})`)
  }
};

function getUid(){
  let now = new Date
  return now.toISOString().slice(0, -5).replace(/:/g,"-")
}

const config = {
  "savePath": {
      "type": "string",
      "default": "./images"
  },
  "relativePath": {
      "type": "string",
      "default": "./"
  },
  "mdPathPrefix": {
      "type": "string",
      "default": ""
  }
}
export {
  config
}
