// Environment variables ───────────────────────────────────────────────────────

switch (true) {
  case (typeof browser !== 'undefined'):
    var PLATFORM = 'firefox'
    var SHELL_EXTENSION_ID = 'shell@alexherbo2.github.com'
    break
  case (typeof chrome !== 'undefined'):
    var PLATFORM = 'chrome'
    var SHELL_EXTENSION_ID = 'ohgecdnlcckpfnhjepfdcdgcfgebkdgl'
    break
}

// Extensions ──────────────────────────────────────────────────────────────────

// Shell
const shell = {}
shell.port = chrome.runtime.connect(SHELL_EXTENSION_ID)

// Settings ────────────────────────────────────────────────────────────────────

const settings = {}

// Open your favorite editor in xterm by default.
settings.editor = 'xterm -e "$EDITOR" "${file}"'

// Sync settings
chrome.storage.sync.get(null, (items) => {
  Object.assign(settings, items)
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (const key in changes) {
    const storageChange = changes[key]
    settings[key] = storageChange.newValue
  }
})

// Commands ────────────────────────────────────────────────────────────────────

// Keyboard shortcuts
// https://developer.chrome.com/extensions/commands
//
// Entry point: Listen for incoming requests.
chrome.commands.onCommand.addListener((name) => {
  const command = commands[name]
  if (command) {
    command()
  }
})

const commands = {}

// Send request to the content script
commands['edit'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    const port = chrome.tabs.connect(tab.id)
    port.postMessage({
      command: 'edit-text-input'
    })
    port.onMessage.addListener((request) => {
      const command = internal.requests[request.command]
      const arguments = request.arguments || []
      const self = {
        port
      }
      if (command) {
        command.apply(self, arguments)
      }
    })
  })
}

// External ────────────────────────────────────────────────────────────────────

// Cross-extension messaging
// https://developer.chrome.com/extensions/messaging#external
//
// Entry point: Listen for incoming requests.
// Each request has the following format:
// {
//   command: String,
//   arguments: Array
// }
chrome.runtime.onConnectExternal.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = external.requests[request.command]
    const arguments = request.arguments || []
    const self = {
      port
    }
    if (command) {
      command.apply(self, arguments)
    }
  })
})

external = {}

// Requests
external.requests = {}

external.requests['set'] = (items) => {
  chrome.storage.sync.set(items)
}

// Send request to the content script
external.requests['edit'] = function() {
  const port = chrome.tabs.connect(this.port.sender.tab.id)
  port.postMessage({
    command: 'edit-text-input'
  })
  port.onMessage.addListener((request) => {
    const command = internal.requests[request.command]
    const arguments = request.arguments || []
    const self = {
      port
    }
    if (command) {
      command.apply(self, arguments)
    }
  })
}

// Internal ────────────────────────────────────────────────────────────────────

internal = {}

// Requests
internal.requests = {}

internal.requests['edit'] = function({ text, anchorLine, anchorColumn, cursorLine, cursorColumn }) {
  shell.port.postMessage({
    id: 'edit',
    shell: true,
    input: text,
    command: `
      # Create temporary file
      file=$(mktemp)
      trap 'rm -f "$file"' EXIT
      # Get input from /dev/stdin
      cat > "$file"
      # Parameters
      # Support named and positional parameters
      anchor_line=${anchorLine}
      anchor_column=${anchorColumn}
      cursor_line=${cursorLine}
      cursor_column=${cursorColumn}
      # Command
      edit() {
        ${settings.editor}
      }
      edit "$file" "$anchor_line" "$anchor_column" "$cursor_line" "$cursor_column" > /dev/null 2>&1
      # Write file to /dev/stdout
      cat "$file"
    `
  })
  shell.port.onMessage.addListener((response) => {
    const text = response.output.replace(/\n$/, '')
    this.port.postMessage({
      command: 'fill-text-input',
      arguments: [text]
    })
  })
}
