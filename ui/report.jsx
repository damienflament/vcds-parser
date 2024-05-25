import { format } from 'string-kit'
import { format as formatDate } from 'date-fns'

import { ClipboardCopy, FontAwesome, Spoiler } from './components.jsx'
import { ModuleView, ModuleReadError } from './module.jsx'

import bulma from '../lib/bulma.js'

const { Field, Control, Message, MessageHeader, MessageBody, Tag, Tags } = bulma.elements

const ReportView = ({ report }) => {
  const {
    date,
    shop,
    vehicle: { mileage, vin, licensePlate, chassis, type },
    modules
  } = report

  const modulesViews = Object.values(modules).map(m => () => {
    try {
      return <ModuleView module={m} />
    } catch (e) {
      return <ModuleReadError module={m} error={e} />
    }
  })

  const InfoTag = ({ icon, title, info, data = null, clipboardCopy = false }) => {
    if (!info) return // Handles optional info

    if (clipboardCopy) {
      info = data
        ? <ClipboardCopy data={data}>{info}</ClipboardCopy>
        : <ClipboardCopy>{info}</ClipboardCopy>
    }

    return (
      <Control>
        <Tags class='has-addons are-medium'>
          <Tag class='is-info' title={title}><FontAwesome name={icon} /></Tag>
          <Tag>{info}</Tag>
        </Tags>
      </Control>
    )
  }

  return (
    <div>
      <Field class='box is-grouped is-grouped-multiline'>
        <InfoTag icon='car-side' title='Chassis (type)' info={`${chassis} (${type})`} />
        <InfoTag icon='car-rear' title='License plate' info={licensePlate} />
        <InfoTag icon='fingerprint' title='VIN' info={vin} clipboardCopy />
        <InfoTag icon='calendar-day' title='Date' info={formatDate(date, 'PPPPp')} />
        <InfoTag icon='road' title='Mileage' info={format('%n km', mileage.km)} data={mileage.km} clipboardCopy />
        <InfoTag icon='warehouse' title='Shop' info={shop} clipboardCopy />
      </Field>
      {modulesViews}
    </div>
  )
}

/** A message showing an error of report parsing. */
const ReportParseError = ({ error: { name, message, stack } }) =>
  <Message>
    <MessageHeader><p>Failed to parse report</p></MessageHeader>
    <MessageBody class='content'>
      <p>This error is <strong>NOT related to the vehicle</strong>. This is a problem with <strong>VCDS Parser</strong>.</p>
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

export { ReportView, ReportParseError }
