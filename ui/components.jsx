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
const FontAwesome = ({ name, style = 'solid' }) =>
  <i class={() => `fa-${van.val(style)} fa-${van.val(name)}`} />

/** A directory upload input using Javascript. */
const DirectoryPicker = ({ label: pickerLabel, directoryName, onsuccess: callback }) => {
  const pickDirectory = () =>
    window.showDirectoryPicker()
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
const StatusTag = ({ children, class: className }) =>
  <Tags class='has-addons'>
    <Tag>{children}</Tag>
    <Tag class={className} />
  </Tags>

/**
 * A spoiler.
 *
 * Hides its content. Has an arrow to show it.
 */
const Spoiler = ({ children }) => {
  const isClosed = van.state(true)

  const iconName = () => isClosed.val ? 'angle-down' : 'angle-up'
  const label = () => isClosed.val ? 'Show more...' : 'Show less...'
  const contentClass = () => isClosed.val ? 'is-sr-only' : ''

  const toggleClosed = () => { isClosed.val = !isClosed.val }

  return (
    <>
      <div class='is-flex is-justify-content-end mb-2'>
        <IconText class='is-flex-direction-row-reverse is-clickable' onclick={toggleClosed}>
          <Icon><FontAwesome name={iconName} /></Icon>
          <span>{label}</span>
        </IconText>
      </div>
      <div class={contentClass}>{children}</div>
    </>
  )
}

/**
 * Shows a piece of data which can be copied to the clipboard.
 *
 * Uses Bulma Tooltip.
 *
 * @see https://bulma-tooltip.netlify.app/get-started/
 */
const ClipboardCopy = ({ children, data = null }) => {
  const readyTooltip = 'Copy data'
  const successTooltip = 'Data copied !'

  const readyClass = 'has-tooltip-arrow'
  const successClass = readyClass + ' has-tooltip-success'

  const className = van.state(readyClass)
  const tooltip = van.state(readyTooltip)

  data ??= children

  const copyData = () => {
    navigator.clipboard.writeText(data)
      .then(() => {
        className.val = successClass
        tooltip.val = successTooltip
      })
      .finally(() => {
        setTimeout(() => {
          className.val = readyClass
          tooltip.val = readyTooltip
        }, 1000)
      })
  }

  return <span class={() => className.val} data-tooltip={() => tooltip.val} onclick={copyData}>{children}</span>
}

export { ClipboardCopy, DirectoryPicker, FontAwesome, Spoiler, StatusTag }
