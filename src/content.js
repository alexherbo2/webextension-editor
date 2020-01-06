// Variables ───────────────────────────────────────────────────────────────────

let lastUsedInput

window.addEventListener('focus', (event) => {
  if (isText(document.activeElement)) {
    lastUsedInput = document.activeElement
  }
}, true)

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

// Requests ────────────────────────────────────────────────────────────────────

const requests = {}

requests['edit'] = (script) => {
  if (! lastUsedInput) {
    return
  }
  if (! script) {
    script = `
      EDITOR=\${EDITOR:-vi}
      xterm -e $EDITOR "$1"
    `
  }
  const [[anchorLine, anchorColumn], [cursorLine, cursorColumn]] = getSelectionRange(lastUsedInput)
  const input = lastUsedInput.value
  lastUsedInput.classList.add('chrome-editor')
  lastUsedInput.value = ''
  lastUsedInput.readOnly = true
  lastUsedInput.blur()
  shell.port.postMessage({
    id: 'edit',
    shell: true,
    command: `
      file=$(mktemp)
      trap 'rm -f "$file"' EXIT
      cat > "$file"
      edit() {
        ${script}
      }
      edit "$file" "${anchorLine}" "${anchorColumn}" "${cursorLine}" "${cursorColumn}" > /dev/null 2>&1
      cat "$file"
    `,
    input
  })
}

// Responses ───────────────────────────────────────────────────────────────────

const responses = {}

responses['edit'] = (response) => {
  const value = response.output.replace(/\n$/, '')
  lastUsedInput.classList.remove('chrome-editor')
  lastUsedInput.readOnly = false
  lastUsedInput.value = value
  lastUsedInput.focus()
}

// Initialization ──────────────────────────────────────────────────────────────

// Requests
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = requests[request.command]
    const arguments = request.arguments || []
    if (command) {
      command(...arguments)
    }
  })
})

// Responses
shell.port.onMessage.addListener((response) => {
  const command = responses[response.id]
  if (command) {
    command(response)
  }
})

// Helpers ─────────────────────────────────────────────────────────────────────

const isText = (element) => {
  const nodeNames = ['INPUT', 'TEXTAREA', 'OBJECT']
  return element.offsetParent !== null && (nodeNames.includes(element.nodeName) || element.isContentEditable)
}

const getSelectionRange = (input) => {
  let [start, end] = []
  switch (input.selectionDirection) {
    case 'forward':
      [anchorPosition, cursorPosition] = [input.selectionStart, input.selectionEnd]
      break
    case 'backward':
      [cursorPosition, anchorPosition] = [input.selectionStart, input.selectionEnd]
      break
  }
  const [anchorLine, anchorColumn] = getSelectionPosition(input, anchorPosition)
  const [cursorLine, cursorColumn] = getSelectionPosition(input, cursorPosition)
  return [[anchorLine, anchorColumn], [cursorLine, cursorColumn]]
}

const getSelectionPosition = (input, position) => {
  const textLines = input.value.substring(0, position).split('\n')
  const line = textLines.length
  const column = textLines[textLines.length - 1].length + 1
  return [line, column]
}
