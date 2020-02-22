# Editor for [Chrome]

###### [Chrome](#chrome) | [Firefox](#firefox)

> Open an external editor to edit text inputs.

## Dependencies

- [Zip] (Zip is used to package the extension)
- [Inkscape] (Inkscape is used to convert SVG to PNG when uploading the extension)

### Extensions

- [Shell] (Chrome API to execute external commands)

## Installation

### Chrome

#### Installing from the Chrome Web Store

https://chrome.google.com/webstore/detail/editor/oaagifcpibmdpajhjfcdjliekffjcnnk

#### Installing from the source

``` sh
make chrome
```

Open the _Extensions_ page by navigating to `chrome://extensions`, enable _Developer mode_ then _Load unpacked_ to select the extension directory: `target/chrome`.

![Load extension](https://developer.chrome.com/static/images/get_started/load_extension.png)

See the [Getting Started Tutorial] for more information.

### Firefox

``` sh
make firefox
```

- Open `about:config`, change `xpinstall.signatures.required` to `false`.
- Open `about:addons` ❯ _Extensions_, click _Install add-on from file_ and select the package file: `target/firefox/package.zip`.

#### Developing

Open `about:debugging` ❯ _This Firefox_ ❯ _Temporary extensions_, click _Load temporary add-on_ and select the manifest file: `target/firefox/manifest.json`.

[![Load extension](https://img.youtube.com/vi_webp/cer9EUKegG4/maxresdefault.webp)](https://youtu.be/cer9EUKegG4)

See [Firefox – Your first extension] for more information.

## Usage

Press <kbd>Control</kbd> + <kbd>i</kbd> to edit the last used text input with your favorite editor.

### Cross-extension messaging

``` javascript
const port = chrome.runtime.connect('oaagifcpibmdpajhjfcdjliekffjcnnk') // for a Chrome extension
const port = chrome.runtime.connect('editor@alexherbo2.github.com') // for a Firefox extension
port.postMessage({
  command: 'edit',
  arguments: [`alacritty --class 'Alacritty · Floating' --command kak "$1" -e "select $2.$3,$4.$5"`]
})
```

More examples can be found at [Krabby].

See [Cross-extension messaging] for more details.

## Configuration

### Chrome

Open `chrome://extensions/configureCommands` to configure the keyboard shortcuts.

### Firefox

Open `about:addons` ❯ _Extensions_ and click _Manage extension shortcuts_ in the menu.

![Manage extension shortcuts](https://user-media-prod-cdn.itsre-sumo.mozilla.net/uploads/gallery/images/2019-02-21-18-47-38-921651.png)

## Commands

- `edit` (<kbd>Control</kbd> + <kbd>i</kbd>) (`xterm -e $EDITOR "$1"`)

## Messages

- `port.postMessage({ command: 'edit', arguments: ['<command> <file> <anchor-line> <anchor-column> <cursor-line> <cursor-column>'] })`

## References

- [Create a keyboard interface to the web]

[Chrome]: https://google.com/chrome/
[Chrome Web Store]: https://chrome.google.com/webstore

[Firefox]: https://mozilla.org/firefox/
[Firefox Add-ons]: https://addons.mozilla.org

[Zip]: http://infozip.sourceforge.net/Zip.html
[Inkscape]: https://inkscape.org

[Shell]: https://github.com/alexherbo2/chrome-shell

[Getting Started Tutorial]: https://developer.chrome.com/extensions/getstarted
[Cross-extension messaging]: https://developer.chrome.com/extensions/messaging#external

[Firefox – Your first extension]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension

[Krabby]: https://krabby.netlify.com
[Create a keyboard interface to the web]: https://alexherbo2.github.io/blog/chrome/create-a-keyboard-interface-to-the-web/
