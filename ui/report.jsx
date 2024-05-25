import { format } from 'string-kit'
import { format as formatDate } from 'date-fns'

import { FontAwesome, Spoiler } from './components.jsx'
import { ModuleView, ModuleReadError } from './module.jsx'

import bulma from '../lib/bulma.js'
import van from '../lib/van.js'

const { Field, Control, Message, MessageHeader, MessageBody, Tag, Tags } = bulma.elements

export const comfortMessage = <p>This error is <strong>NOT related to the vehicle</strong>. This is a problem with <strong>VCDS Parser</strong>.</p>

/** A message showing an error of report parsing. */
const ReportParseError = ({ error: { name, message, stack } }) =>
  <Message>
    <MessageHeader><p>Failed to parse report</p></MessageHeader>
    <MessageBody class='content'>
      {comfortMessage}
      <Spoiler>
        <p><strong>{name}</strong>: {message}</p>
        <pre>{stack}</pre>
      </Spoiler>
    </MessageBody>
  </Message>

/** A tag showing a piece of information. */
const ReportInfoTag = ({ icon, title, info, data = null, isCopiable = false }) => {
  if (!info) return

  let infoTag

  if (data || isCopiable) {
    const initClass = 'is-hoverable has-tooltip-arrow'
    const initTooltip = 'Copy data'

    const tagClass = van.state(initClass)
    const tooltip = van.state(initTooltip)

    const copyData = () => {
      navigator.clipboard.writeText(data ?? info)
        .then(() => {
          tagClass.val = `${initClass} has-tooltip-success`
          tooltip.val = 'Data copied !'
        })
        .finally(() => {
          setTimeout(() => {
            tagClass.val = initClass
            tooltip.val = initTooltip
          }, 1000)
        })
    }

    infoTag = <Tag class={() => tagClass} data-tooltip={tooltip} onclick={copyData}>{info}</Tag>
  } else {
    infoTag = <Tag>{info}</Tag>
  }

  return (
    <Control>
      <Tags class='has-addons are-medium'>
        <Tag class='is-info' title={title}><FontAwesome name={icon} /></Tag>
        {infoTag}
      </Tags>
    </Control>
  )
}

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

  return (
    <div>
      <Field class='box is-grouped is-grouped-multiline'>
        <ReportInfoTag icon='car-side' title='Chassis (type)' info={`${chassis} (${type})`} />
        <ReportInfoTag icon='car-rear' title='License plate' info={licensePlate} />
        <ReportInfoTag icon='fingerprint' title='VIN' info={vin} isCopiable />
        <ReportInfoTag icon='calendar-day' title='Date' info={formatDate(date, 'PPPPp')} />
        <ReportInfoTag icon='road' title='Mileage' info={format('%n km', mileage.km)} data={mileage.km} />
        <ReportInfoTag icon='warehouse' title='Shop' info={shop} isCopiable />
      </Field>
      {modulesViews}
    </div>
  )
}

export { ReportView, ReportParseError }
