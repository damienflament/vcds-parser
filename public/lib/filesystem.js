/**
 * Filesystem utlities.
 * @module
 */

/**
 * Requests a **read permission** for the given file.
 *
 * Readonly permission is queried. If necessary, permission is requested.
 *
 * The returned permission should be "granted" or "denied". If it is "prompt",
 * it means the permission must be requested after a user interaction.
 *
 * @param {FileSystemHandle} file the handle to the file to request the permission for
 * @returns {Promise<PermissionState>} the permission for the given file
 */
export async function requestPermission (file) {
  return file.queryPermission({ mode: 'read' }).then(p => p === 'prompt'
    // If the permission is 'prompt', it must be requested.
    ? file.requestPermission({ mode: 'read' })
      // If the permission is still 'prompt' after we prompted the user, he
      // musted cancel it.
      // We regard this as a bug and put the value 'denied'.
      .then(p => p === 'prompt' ? 'denied' : p)
      .catch(e => {
        if (e instanceof DOMException && e.name === 'SecurityError') {
          // The permission has been requested without user interaction
          // (automatically on page load)
          return 'prompt'
        } else {
          throw e
        }
      })
    : p
  )
}

/**
 * Lists the files contained in the given directory.
 *
 * @param {FileSystemDirectoryHandle} directory the directory to list files from
 * @returns {Promise<[FileSystemFileHandle]>} an array containing the handles of the files contained in the directory
 */
export async function listDirectory (directory) {
  const files = []

  for await (const file of directory.values()) {
    if (file.kind === 'file') {
      files.push(file)
    }
  }

  return files
}

/**
 * Loads the content of the given file into the given state.
 *
 * @param {FileSystemFileHandle} fileHandle the handle to the file to load content from
 * @param {(any) => any} onsuccess called with the loaded content as parameter
 */
export async function loadFileContent (fileHandle, onsuccess) {
  const options = { mode: 'read' }

  fileHandle.queryPermission(options).then(permission => {
    if (permission === 'granted') {
      fileHandle.getFile().then(file => {
        const reader = new FileReader()

        reader.onload = (ev) => { onsuccess(ev.target.result) }

        reader.readAsText(file)
      })
    }
  })
}
