# Editor for [Chrome] and [Firefox] – [WebExtensions]

[Chrome]: https://google.com/chrome/
[Firefox]: https://mozilla.org/firefox/
[WebExtensions]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

<img src="https://github.com/FortAwesome/Font-Awesome/raw/master/svgs/solid/edit.svg" height="16" align="right">

Open an external editor to edit text inputs.

## Dependencies

- [jq]

[jq]: https://stedolan.github.io/jq/

###### Extensions

- [Shell]

[Shell]: https://github.com/alexherbo2/webextension-shell

## Installation

###### Chrome

``` sh
make chrome
```

Open the _Extensions_ page by navigating to `chrome://extensions`, enable _Developer mode_ then _Load unpacked_ to select the extension directory: `target/chrome`.

###### Firefox

``` sh
make firefox
```

- Open `about:config`, change `xpinstall.signatures.required` to `false`.
- Open `about:addons` ❯ _Extensions_, click _Install add-on from file_ and select the package file: `target/firefox/package.zip`.

## Configuration

###### Chrome

Open `chrome://extensions/configureCommands` to configure the keyboard shortcuts.

###### Firefox

Open `about:addons` ❯ _Extensions_ and click _Manage extension shortcuts_ in the menu.

## Usage

Press <kbd>Control</kbd> + <kbd>i</kbd> to edit the last used text input with your favorite editor.

## Commands

###### `edit`

Edit the last used text input with your favorite editor.
Default: <kbd>Control</kbd> + <kbd>i</kbd>.

## Options

###### `editor`

Sets the editor to be used.

Parameters:

- `file`
- `anchor_line`
- `anchor_column`
- `cursor_line`
- `cursor_column`

Default: `xterm -e "$EDITOR" "${file}"`.

**Example** – Open [Kakoune] in [Alacritty]:

``` sh
alacritty --class 'popup' --command \
  kak "${file}" -e "
    select ${anchor_line}.${anchor_column},${cursor_line}.${cursor_column}
  "
```

[Kakoune]: https://kakoune.org
[Alacritty]: https://github.com/alacritty/alacritty

## Cross-extension messaging

``` javascript
// Environment variables
switch (true) {
  case (typeof browser !== 'undefined'):
    var PLATFORM = 'firefox'
    var EDITOR_EXTENSION_ID = 'editor@alexherbo2.github.com'
    break
  case (typeof chrome !== 'undefined'):
    var PLATFORM = 'chrome'
    var EDITOR_EXTENSION_ID = 'oaagifcpibmdpajhjfcdjliekffjcnnk'
    break
}

// Initialization
const editor = {}
editor.port = chrome.runtime.connect(EDITOR_EXTENSION_ID)
editor.send = (command, ...arguments) => {
  editor.port.postMessage({ command, arguments })
}

// Usage
editor.send('edit')
```

You can find some examples in [Krabby].

[Krabby]: https://krabby.netlify.app

See the [source](src) for a complete reference.
