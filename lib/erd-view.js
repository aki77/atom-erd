'use babel';

import { BufferedProcess, CompositeDisposable } from 'atom';
import promisify from 'util.promisify';
import tmp from 'tmp';
import fs from 'fs';
import { requireFromPackage } from './util';

const tmpName = promisify(tmp.tmpName);
const writeFileAsync = promisify(fs.writeFile);

const ImageEditor = requireFromPackage('image-view', 'image-editor');

export default class ErdView {
  constructor(editor) {
    this.editor = editor;
    this.alive = true;

    this.subscriptions = new CompositeDisposable();
    this.handleEvents();
  }

  destroy() {
    if (!this.alive) {
      return;
    }

    this.alive = false;
    const pane = atom.workspace.paneForItem(this.imageEditor);
    if (pane) {
      pane.destroyItem(this.imageEditor);
      // pane.destroy();
    }
    if (this.imageEditor) {
      this.imageEditor.destroy();
      this.imageEditor = null;
    }
    this.editor = null;
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

  isAlive() {
    return this.alive;
  }

  handleEvents() {
    this.subscriptions.add(this.editor.onDidStopChanging(this.updateImageFile.bind(this)));
    this.subscriptions.add(this.editor.onDidDestroy(this.destroy.bind(this)));
    this.subscriptions.add(
      atom.workspace.onDidChangeActivePaneItem(this.changeItemHandler.bind(this)),
    );
  }

  async show() {
    this.imageFilePath = await tmpName({ postfix: '.png' });
    await this.updateImageFile();
    this.imageEditor = new ImageEditor(this.imageFilePath);
    this.imageEditor.getTitle = () => 'ERD Preview';

    this.subscriptions.add(
      this.imageEditor.view.onDidLoad(() => {
        this.imageEditor.view.zoomToFit();
      }),
    );

    const srcPane = atom.workspace.getActivePane();
    const pane = this.getAdjacentPane();
    if (pane) {
      pane.activateItem(this.imageEditor);
    } else {
      srcPane.splitDown({ items: [this.imageEditor] });
    }

    srcPane.activate();
    atom.commands.add(this.imageEditor.element, 'erd:toggle', this.destroy.bind(this));
  }

  getAdjacentPane() {
    const activePane = atom.workspace.getActivePane();
    const children = activePane.getParent().getChildren && activePane.getParent().getChildren();
    if (!children) {
      return null;
    }
    const index = children.indexOf(activePane);

    return [children[index + 1], children[index - 1]].find(
      pane => pane && pane.constructor && pane.constructor.name === 'Pane',
    );
  }

  changeItemHandler(item) {
    if (![this.editor, this.imageEditor].includes(item)) {
      this.destroy();
    }
  }

  async updateImageFile() {
    if (this.process) {
      this.process.kill();
    }

    const { tmpFilePath, cleanupCallback } = await this.saveTmpFile();

    return new Promise((resolve, reject) => {
      this.process = new BufferedProcess({
        command: atom.config.get('erd.erdCommandPath'),
        args: ['-i', tmpFilePath, '-o', this.imageFilePath],
        exit: (code) => {
          this.process = null;
          cleanupCallback();
          if (code > 0) {
            reject();
          } else {
            resolve();
          }
        },
      });
    });
  }

  saveTmpFile() {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix: '.er' }, (error, tmpFilePath, fd, cleanupCallback) => {
        if (error) {
          reject(error);
          return;
        }

        writeFileAsync(fd, this.editor.getText()).then(() => {
          resolve({ tmpFilePath, cleanupCallback });
        });
      });
    });
  }
}
