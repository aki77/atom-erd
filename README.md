# ERD

Translates a plain text description of a relational database schema to a graphical entity-relationship diagram.

![screencast](https://i.gyazo.com/3de87b53f16cd8e4fed7d145f996bbe2.gif)

## Requirement
- [BurntSushi/erd](https://github.com/BurntSushi/erd)

## Commands
- `erd:toggle`

## Settings

* `erdCommandPath` (default: erd)

## Keymap

No keymap by default.

edit `~/.atom/keymap.cson`

```coffeescript
'atom-text-editor[data-grammar~="erd"]':
  'ctrl-M': 'erd:toggle'
```

## TODO
- [ ] Export
- [ ] Snippets
