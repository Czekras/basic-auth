import JSZip from 'jszip'

/**
 * Saves a single text file to the user's downloads via a synthetic `<a download>` click.
 *
 * @param {string} filename - Name the saved file should have (e.g. ".htaccess").
 * @param {string} text - File contents.
 * @returns {boolean} True if the blob was created and the download was triggered.
 */
export function downloadFile(filename, text) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    triggerDownload(blob, filename)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Bundles several files into a single .zip and downloads it.
 *
 * @param {Object<string, string>} files - Map of filename to file contents.
 * @param {string} zipName - Name the saved archive should have.
 * @returns {Promise<boolean>} True once the archive was built and the download was triggered.
 */
export async function downloadZip(files, zipName) {
  try {
    const zip = new JSZip()
    for (const [name, content] of Object.entries(files)) zip.file(name, content)
    const blob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(blob, zipName)
    return true
  } catch (err) {
    console.error('zip build failed', err)
    return false
  }
}

// Delay URL revocation so the browser can begin the synthetic download first.
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
