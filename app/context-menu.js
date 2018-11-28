// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

import { remote, shell, clipboard } from 'electron';

const { Menu, MenuItem } = remote;

const isAnyTextSelected = () => window.getSelection().toString() !== '';

const cut = new MenuItem({
  label: 'Cut',
  click: () => {
    document.execCommand('cut');
  }
});

const copy = new MenuItem({
  label: 'Copy',
  click: () => {
    document.execCommand('copy');
  }
});

const paste = new MenuItem({
  label: 'Paste',
  click: () => {
    document.execCommand('paste');
  }
});

let imgUrlToOpen = '';
const imgOpen = new MenuItem({
  label: 'Open image in browser',
  click: () => {
    shell.openExternal(imgUrlToOpen);
  }
});

const imgCopyUrl = new MenuItem({
  label: 'Copy image url',
  click: () => {
    clipboard.writeText(imgUrlToOpen);
  }
});

const normalMenu = new Menu();
normalMenu.append(copy);

const textEditingMenu = new Menu();
textEditingMenu.append(cut);
textEditingMenu.append(copy);
textEditingMenu.append(paste);

const imgMenu = new Menu();
imgMenu.append(imgOpen);
imgMenu.append(imgCopyUrl);

document.addEventListener(
  'contextmenu',
  event => {
    if (event.target.className.indexOf('CodeMirror') !== -1) {
      event.preventDefault();
      textEditingMenu.popup(remote.getCurrentWindow());
      return;
    }

    switch (event.target.nodeName) {
      case 'IMG':
        imgUrlToOpen = event.target.getAttribute('src');
        if (imgUrlToOpen.startsWith('https://')) {
          event.preventDefault();
          imgMenu.popup(remote.getCurrentWindow());
        }
        break;
      case 'TEXTAREA':
      case 'INPUT':
        event.preventDefault();
        textEditingMenu.popup(remote.getCurrentWindow());
        break;
      default:
        if (isAnyTextSelected()) {
          event.preventDefault();
          normalMenu.popup(remote.getCurrentWindow());
        }
    }
  },
  false
);
