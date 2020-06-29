// State ───────────────────────────────────────────────────────────────────────

const state = {}
state.lastUsedInput = null

window.addEventListener('focus', (event) => {
  if (isText(event.target)) {
    state.lastUsedInput = event.target
  }
}, true)

// Requests ────────────────────────────────────────────────────────────────────

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = requests[request.command]
    const arguments = request.arguments || []
    const self = {
      port
    }
    if (command) {
      command.apply(self, arguments)
    }
  })
})

const requests = {}

requests['edit-text-input'] = function() {
  if (! state.lastUsedInput) {
    return
  }
  const [[anchorLine, anchorColumn], [cursorLine, cursorColumn]] = getSelectionRange(state.lastUsedInput)
  const text = state.lastUsedInput.value
  state.lastUsedInput.classList.add('webextension-editor')
  state.lastUsedInput.value = ''
  state.lastUsedInput.readOnly = true
  state.lastUsedInput.blur()
  this.port.postMessage({
    command: 'edit',
    arguments: [{ text, anchorLine, anchorColumn, cursorLine, cursorColumn }]
  })
}

requests['fill-text-input'] = (text) => {
  state.lastUsedInput.classList.remove('webextension-editor')
  state.lastUsedInput.readOnly = false
  state.lastUsedInput.value = text
  state.lastUsedInput.focus()
}

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
  const textLines = input.value.slice(0, position).split('\n')
  const line = textLines.length
  const column = textLines[textLines.length - 1].length + 1
  return [line, column]
}
