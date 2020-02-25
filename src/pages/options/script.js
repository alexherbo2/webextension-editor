// Saves options to chrome.storage.
const saveOptions = () => {
  const editor = document.getElementById('editor').value
  const options = {
    editor
  }
  chrome.storage.sync.set(options, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status')
    status.textContent = 'Options saved.'
    setTimeout(() => {
      status.textContent = ''
    }, 750)
  })
}

// Restores options using the preferences stored in chrome.storage.
const restoreOptions = () => {
  const options = {
    editor: 'xterm -e "$EDITOR" "${file}"'
  }
  chrome.storage.sync.get(options, (items) => {
    const editor = document.getElementById('editor')
    editor.value = items.editor
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
