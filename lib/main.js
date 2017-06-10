'use babel';

import { CompositeDisposable } from 'atom';
import ErdView from './erd-view';

export default {
  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-text-editor[data-grammar~="erd"]', {
        'erd:toggle': ({ currentTarget }) => this.toggle(currentTarget.getModel()),
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle(editor) {
    if (this.view && this.view.isAlive()) {
      this.view.destroy();
      this.view = null;
    } else {
      this.view = new ErdView(editor);
      this.view.show();
    }
  },
};
