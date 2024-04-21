/**
 * Filesystem utlities.
 * @module
 */

/**
 * Requests a **read permission** for the given file.
 *
 * Readonly permission is queried. If necessary, permission is requested.
 *
 * The returned permission should be "granted" or "denied". If it is
 * "prompt", it means the permission must be requested due to a user
 * interaction.
 *
 * @param {FileSystemHandle} file the file to request the permission for
 * @returns {Promise<PermissionState>} the permission for the given file
 */
export async function requestPermission (file) {
  const options = { mode: 'read' }

  let permission = await file.queryPermission(options)

  if (permission === 'prompt') {
    // The permission must be requested. Try it.
    try {
      permission = await file.requestPermission(options)

      // If the permission is still "prompt" after we prompted the
      // user, he musted cancel it.
      // We regard this as a bug and put the value "denied".
      if (permission === 'prompt') {
        permission = 'denied'
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        // The permission has been requested without user interaction
        permission = 'prompt'
      }
    }
  }

  return permission
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
