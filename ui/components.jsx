/**
 * Reactive VanJS components styled with Bulma.
 *
 * @see {@link https://bulma.io/}
 * @see {@link https://vanjs.org/}
 * @module
 */

import bulma from '../lib/bulma.js'
import van from '../lib/van.js'

const { File, FileCta, FileIcon, FileName, Icon, IconText, Tag, Tags } = bulma.elements

/** A Font Awesome icon. */
const FontAwesome = ({ name, style = 'solid' }) => <i class={`fa-${style} fa-${name}`} />

/** A directory upload input using Javascript. */
const DirectoryPicker = ({ label: pickerLabel, directoryName, onsuccess: callback }) => {
  const pickDirectory = () => window.showDirectoryPicker()
    .then(d => callback(d))
    .catch(e => {
      if (e instanceof DOMException && e.name === 'AbortError') {
        ; // The user aborted the directory picker.
      } else {
        throw e
      }
    })

  return (
    <File class='has-name is-fullwidth'>
      <label class='file-label' onclick={pickDirectory}>
        <FileCta>
          <FileIcon><FontAwesome name='folder-open' /></FileIcon>
          <span class='file-label'>{pickerLabel}</span>
        </FileCta>
        <FileName>{directoryName}</FileName>
      </label>
    </File>
  )
}

/** A double tag to display a label on the left with a colored tag on the right. */
const StatusTag = ({ children, class: klass }) =>
  <Tags class='has-addons'>
    <Tag>{children}</Tag>
    <Tag class={klass} />
  </Tags>

/**
 * A spoiler.
 *
 * Hides its content. Has an arrow to show it.
 */
const Spoiler = ({ children }) => {
  const isClosed = van.state(true)
  const toggleClosed = () => { isClosed.val = !isClosed.val }

  return (
    <div>
      <div class='is-flex is-justify-content-end mb-2'>
        <IconText class='is-flex-direction-row-reverse is-clickable' onclick={toggleClosed}>
          <Icon>{() => <FontAwesome name={isClosed.val ? 'angle-down' : 'angle-up'} />}</Icon>
          <span>{() => isClosed.val ? 'Show more...' : 'Show less...'}</span>
        </IconText>
      </div>
      <div class={() => isClosed.val ? 'is-sr-only' : ''}>{children}</div>
    </div>
  )
}

export { DirectoryPicker, FontAwesome, Spoiler, StatusTag }
