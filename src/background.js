// Requests ────────────────────────────────────────────────────────────────────

const requests = {}

requests['edit'] = (...arguments) => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    const port = chrome.tabs.connect(tab.id)
    port.postMessage({ command: 'edit', arguments })
  })
}

// Initialization ──────────────────────────────────────────────────────────────

// Commands
chrome.commands.onCommand.addListener((commandRequest) => {
  const command = requests[commandRequest]
  if (command) {
    command()
  }
})

// Requests
chrome.runtime.onConnectExternal.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = requests[request.command]
    const arguments = request.arguments || []
    if (command) {
      command(...arguments)
    }
  })
})
