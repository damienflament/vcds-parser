/* Peggy grammar to parse VSCD scan reports. */
{{
  import { Duration, Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, PartNumber, Report, Subsystem, Vehicle } from './report.js'

  function string(str) {
    str = str.trim()

    if (str.length === 0) {
      str = null
    }

    return str
  }

  function integer(str) {
    return parseInt(str)
  }

}}

{
  const r = new Report()
  let m = null
}

start
  = report
  {
    r.commit()
    return r
  }

report
  = date:datetime eol
    'VCDS -- Windows Based VAG/VAS Emulator Running on Windows 10 x64' eol
    'VCDS Version:' _ version:versionSpecifier _ '(' platform:('x64') ')' eol
    'Data version:' _ dataDate:dataVersionDate _ dataVersion:dataVersionSpecifier eol
    'www.Ross-Tech.com' eol
    l
    'Dealer/Shop Name:' _ shop:$rol eol
    l
    'VIN:' _ vin:vin _+ 'License Plate:' _ licensePlate:( $licensePlate )? eol
    l+
    'Chassis Type:' _ chassis:chassis _ '(' type:type ')' eol
    'Scan:' rol eol // ignore module addresses list
    l
    'VIN:' _ vin _+ 'Mileage:' _ mileage:mileage eol
    l
    moduleStatus+
    l+
    moduleInfo+
    'End' '-'+ '(Elapsed Time:' _ duration:duration ')' '-'+ '\r\n'

  {
    r.date = date
    r.duration = duration
    r.softwareVersion = version
    r.softwarePlatform = platform
    r.dataVersionDate = dataDate
    r.dataVersion = dataVersion
    r.shop = shop

    const v = new Vehicle()
    v.vin = vin
    v.mileage = mileage
    v.licensePlate = licensePlate
    v.chassis = chassis
    v.type = type
    v.commit()

    r.vehicle = v
  }

datetime
  = dayName ',' day ',' monthName ',' year ',' hours ':' minutes ':' seconds ':00009'
  {
    const d = new Date(text())
    Object.freeze(d)
    return d
  }
duration
  = minutes:$minutes ':' seconds:$seconds
  {
    const d = new Duration(integer(minutes), integer(seconds))
    d.commit()
    return d
  }
dayName 'the name of a week day'
  = 'Monday' / 'Tuesday' / 'Wednesday' / 'Thursday' / 'Friday' / 'Saturday' /
    'Sunday'
day 'a day number'
  = $([0-2][0-9] / '3'[0-1])
monthName 'the name of a month'
  = 'January' / 'February' / 'March' / 'April' / 'May' / 'June' / 'July' /
    'August' / 'September' / 'October' / 'November' / 'December'
year 'a year'
  = $[12][0-9]|3|
hours 'hours'
  = $( [01][0-9] / '2'[0-3] )
minutes 'minutes'
  = $[0-5][0-9]
seconds 'seconds'
  = $[0-5][0-9]

versionSpecifier 'a version specifier'
  = $( dec+ '.' dec+ '.' dec+ '.' dec+ )
dataVersionDate 'a VCDS data version date'
  = $dec|8|
dataVersionSpecifier 'a VCDS data version specifier'
  = $( 'DS' dec|3| '.' dec )

vin 'a VIN (Vehicule Identification Number)'
  = $uppnum|17|
licensePlate 'a license plate number'
  = $[A-Z0-9-]+
chassis 'a VAG chassis code'
  = @$uppnum|2|
type 'a VAG vehicle, engine or transmission type code'
  = @$uppnum|3|
mileage 'a mileage value in km and miles'
  = km:$dec+ 'km' '-' miles:$dec+ 'miles'
  {
    const m = new Mileage(km, miles)
    m.commit()
    return m
  }

moduleStatus
  = address:moduleAddress '-' name:$[^-]+ '--' _ 'Status:' _ description:$[^01]+ flags:$bin|4| eol
  {
    m = new Module()
    m.address = address
    m.name = string(name)

    m.status = new ModuleStatus(flags)
    m.status.description = string(description)
    m.status.commit()

    r.addModule(m)
  }
moduleAddress 'a module address' = $dec|2|

moduleInfo
  = dashLine
    'Address' _ address:moduleAddress ':'
      infos:(
          [^\r]+ // ignore module name
          eol
          'Cannot be reached' eol
          {
            const m = r.getModule(address)

            m.isReachable = false

            m.commit()
          }
      /
          [^:]+ // ignore module name
          ':'
          '.'? // this dot '.' just after the colon ':' may be a bug
          _ labels:$rol
          eol

        _|3| partNumber:(
            'Part No:' _ @partNumber
            /
            'Part No' _ 'SW:' _ software:partNumber _+ 'HW:' _ hardware:( partNumber / 'Hardware No' { return null } ) rol // 'Hardware No' value may be a bug
            { return { software, hardware } }
          ) eol
        _|3| 'Component:' _ component:$rol eol
        revision:( _|3| 'Revision:' _ @$w _+ )?
          serial:( 'Serial number:' _ @$w eol )?
        coding:( _|3| 'Coding:' _ @codingValue eol )?
        _|3| 'Shop #:' _ 'WSC' _ codingWsc:shopWsc eol
        _|3| 'VCID:' _ vcid:vcid eol
        vinid:( _|3| 'VINID:' _ @vinid eol )?
        l
        subsystems:subsystem*
        faults:faultsSection
        readiness:( 'Readiness:' _ @readiness eol )?
        {
          const m = r.getModule(address)

          m.isReachable = true

          m.info = new ModuleInfo()

          m.info.labelsFile = labels
          m.info.partNumber = partNumber
          m.info.component = string(component)
          m.info.revision = revision
          m.info.serial = serial
          m.info.coding = coding
          m.info.codingWsc = codingWsc
          m.info.vcid = vcid
          m.info.vinid = vinid
          m.info.readiness = readiness

          m.info.commit()

          for (const s of subsystems) {
            m.addSubsystem(s)
          }

          for (const f of faults) {
            m.addFault(f)
          }

          m.commit()
        }
      )
    l


/*
  Part Number
  ===========

  see https://blog.europaparts.com/audi-vw-part-numbers-demystified/

  Main group
  ----------

  1   Engine
  2   Gas Tank, Lines, Exhaust, Heater
  3   Transmission
  4   Front Axle, Differential, Steering
  5   Rear Suspension
  6   Wheels and Brakes
  7   Hand and Foot Levers/Pedals, Safety Covers
  8   Body Parts and Interior Trim
  9   Electrical and Electrical Systems
  0  Accessories (Jacks, Tools, Stickers, and Radio Equipment)

  Subgroup
  --------

  98  repair kit

  Specific number
  ---------------

  0XX   major assembly

  XXy   y is even:  left side
        y is odd:   right side

  Modification code
  -----------------

  X   re-manufactured part

*/
partNumber 'a part number'
  = type:partType _ group:partGroup subgroup:partSubgroup _ number:partSpecNumber modificationCode:(_ @partModifCode)?
  {
    const pn = new PartNumber()

    pn.type = type
    pn.group = group
    pn.subgroup = subgroup
    pn.number = number
    pn.modification = modificationCode

    pn.commit()

    return pn
  }
partType 'the system type number of a part number' = $uppnum|3|
partGroup 'the main group of a part number' = dec
partSubgroup 'the subgroup of a part number' = $dec|2|
partSpecNumber 'the specific number of a part' = $dec|3|
partModifCode 'the modification code of a part number' = upp

codingValue 'a coding value' = $hexa+
shopWsc 'a shop WSC' = $( shortShopWsc _ dec|3| _ dec|5| )
shortShopWsc 'a short shop WSC' = $dec|5|
vcid 'a VCID' = $( hexa|18| '-' hexa|4| )
vinid 'a VINID' = $hexa|34|
readiness 'readiness flags' = $( bin|4| _ bin|4| )

subsystem
  = _|3| 'Subsystem' _ index:$dec+ _ '-' _ 'Part No:' _ partNumber:partNumber labels:( _+ 'Labels:' _ @$rol )? eol
    _|3| 'Component:' _ component:$rol eol
    coding:( _|3| 'Coding:' _ @codingValue eol )?
    wsc:( _|3| 'Shop #: WSC' _ @shortShopWsc rol eol )?
    ( [A-Z0-9 ]i+ eol )? // ignore this line as it contains the same info as above
    l
  {
    const s = new Subsystem()

    s.index = integer(index)
    s.partNumber = partNumber
    s.component = string(component)
    s.labelsFile = labels
    s.coding = coding
    s.codingWsc = wsc

    s.commit()

    return s
  }

faultsSection
  = (
    'No fault code found.' eol
    { return [] }
    /
    [1-9][0-9]* _ 'Fault' 's'? _ 'Found:' eol
    faults:fault+
    { return faults }
  )

fault
  = code:faultCode _ '-' _ subject:$rol eol
    _|12| errorCode:(@errorCode _ '-' _)? descriptionCode:faultDescCode _ '-' _ description:$rol eol
    freezeFrame:(freezeFrame)?
  {
    const f = new Fault()

    f.code = code
    f.subject = string(subject)
    f.errorCode = errorCode
    f.descriptionCode = descriptionCode
    f.description = description
    f.freezeFrame = freezeFrame

    f.commit()

    return f
  }

errorCode 'error code' = $( 'P'? dec|4| )
faultCode 'fault code' = $dec|5|
faultDescCode 'fault description code' = $dec|3|

freezeFrame
  = _|13| 'Freeze Frame:' eol
    _|20| 'Fault Status:' _ status:$bin|8| eol
    _|20| 'Fault Priority:' _ priority:dec eol
    _|20| 'Fault Frequency:' _ frequency:$dec+ eol
    _|20| 'Reset counter:' _ resetCounter:$dec+ eol
    _|20| 'Mileage:' _ value:$dec+
      _ mileage:(
        'km' { return Mileage.fromKm(integer(value)) }
      /
        'miles' { return Mileage.fromMiles(integer(value)) }
      ) eol
    _|20| 'Time Indication:' _ timeIndication:$dec eol
l
  {
    const ff = new FreezeFrame()

    ff.status = status
    ff.priority = integer(priority)
    ff.frequency = integer(frequency)
    ff.resetCounter = integer(resetCounter)
    ff.timeIndication = timeIndication

    mileage.commit()
    ff.mileage = mileage

    ff.commit()

    return ff
  }


dashLine 'a dash line' = '-'+ eol

dec 'a decimal character' = [0-9]
hexa 'an hexadecimal character' = [0-9A-F]
bin 'a binary character' = [01]
upp 'an uppercase alphabetic character' = [A-Z]
uppnum 'an alphanumeric uppercase character' = [0-9A-Z]

_ 'a blank space' = ' '
w 'a word' = [^ \r\n]+
l 'an empty line' = _* eol
eol 'the end of the line' = '\r\n' // Those reports are produced under Windows
rol 'the rest of the line' = [^\r]*
