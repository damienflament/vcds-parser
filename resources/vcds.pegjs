/* Peggy grammar to parse VSCD scan reports. */
{{
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

start
  = report

report
  = date:datetime eol
    'VCDS -- Windows Based VAG/VAS Emulator Running on Windows 10 x64' eol
    'VCDS Version:' _ version:versionSpecifier _ '(' platform:('x64') ')' eol
    'Data version:' _ dataDate:dataVersionDate _ dataVersion:dataVersionSpecifier eol
    'www.Ross-Tech.com' eol
    l
    'Dealer/Shop Name:' _ shop:$rol eol
    l
    'VIN:' _ vin:vin _+ 'License Plate:' _ licensePlate:licensePlate eol
    l+
    'Chassis Type:' _ chassis:chassis eol
    'Scan:' rol eol // ignore module addresses list
    l
    'VIN:' _ vin _+ 'Mileage:' _ mileage:mileage eol
    l
    modulesStatus:module|1.., eol|
    l+
    moduleInfos:moduleInfo+
    'End' '-'+ '(Elapsed Time:' _ duration:$( minutes ':' seconds ) ')' '-'+ '\r\n'

  {
    const hashedModuleInfos = {}

    for (const m of moduleInfos) {
      hashedModuleInfos[m['address']] = m
    }

    const modules = {}

    for (const m of modulesStatus) {
      const address = m['address']
      modules[address] = Object.assign(m, hashedModuleInfos[address])
    }

    return {
      report: {
        date,
        shop,
      },
      software: {
        version,
        platform,
        data: {
          date: dataDate,
          version: dataVersion
        }
      },
      vehicule: {
        vin,
        licensePlate: string(licensePlate),
        chassis,
        mileage
      },
      modules
    }
  }

datetime 'a date and time'
  = dayName ',' day ',' monthName ',' year ',' hours ':' minutes ':' seconds ':00009'
  { return new Date(text()) }
dayName
  = 'Monday' / 'Tuesday' / 'Wednesday' / 'Thursday' / 'Friday' / 'Saturday' /
    'Sunday'
day = $([0-2][0-9] / '3'[0-1])
monthName
  = 'January' / 'February' / 'March' / 'April' / 'May' / 'June' / 'July' /
    'August' / 'September' / 'October' / 'November' / 'December'
year = $[12][0-9]|3|
hours = $( [01][0-9] / '2'[0-4] )
minutes = $[0-5][0-9]
seconds = $[0-5][0-9]

versionSpecifier 'a version specifier' = $( num+ '.' num+ '.' num+ '.' num+ )
dataVersionDate = $num|8|
dataVersionSpecifier = $( 'DS' num|3| '.' num )

vin 'a VIN' = $uppnum|17|
licensePlate 'a license plate number' = $[A-Z0-9-]*
chassis 'a chassis code' = @$uppnum|2| _ '(' uppnum+ ')'
mileage
  = km:$num+ 'km' '-' miles:$num+ 'miles'
  { return { km: integer(km), miles: integer(miles) } }

module
  = address:moduleAddress '-' name:$[^-]+ '--' _
    'Status:' _ statusDescription:$[^01]+ status:$bin|4|
  {
    return {
      address,
      name: string(name),
      status: {
        flags: status,
        description: string(statusDescription)
      }
    }
  }
moduleAddress 'a module address' = $hexa|2|

moduleInfo
  = dashLine
    'Address' _ address:moduleAddress ':'
      [^:]+ // ignore module name
      ':'
      '.'?  // this dot '.' just after the colon ':' may be a bug
      _ labels:$rol eol
    _|3| partNumber:(
        'Part No:' _ @partNumber
        /
        'Part No' _ 'SW:' _ software:partNumber _+ 'HW:' _ hardware:( partNumber / 'Hardware No' ) rol // 'Hardware No' value may be a bug
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
    l
  {
    return {
      address,
      labelsFile: labels,
      partNumber,
      component: string(component),
      revision,
      serial,
      coding : {
        value: coding,
        wsc: codingWsc
      },
      vcid,
      vinid,
      subsystems,
      faults,
      readiness
    }
  }

partNumber 'a part number' = $( uppnum|3| _ num|3| _ num|3| (_ upp)? )
codingValue 'a coding value' = $hexa+
shopWsc 'a shop WSC' = $( shortShopWsc _ num|3| _ num|5| )
shortShopWsc 'a short shop WSC' = $num|5|
vcid 'a VCID' = $( hexa|18| '-' hexa|4| )
vinid 'a VINID' = $hexa|34|
readiness 'readiness flags' = $( bin|4| _ bin|4| )

subsystem
  = _|3| 'Subsystem' _ index:$num+ _ '-' _ 'Part No:' _ partNumber:partNumber labels:( _+ 'Labels:' _ @$rol )? eol
    _|3| 'Component:' _ component:$rol eol
    coding:( _|3| 'Coding:' _ @codingValue eol )?
    wsc:( _|3| 'Shop #: WSC' _ @shortShopWsc rol eol )?
    ( [A-Z0-9 ]i+ eol )? // ignore this line as it contains the same info as above
    l
  {
    return {
      index: integer(index),
      partNumber,
      component: string(component),
      labelsFile: labels,
      coding: {
        value: coding,
        wsc: wsc
      }
    }
  }

faultsSection 'a faults section'
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
    return {
      code,
      subject: string(subject),
      errorCode,
      descriptionCode,
      description: string(description),
      freezeFrame
    }
  }

errorCode 'error code' = $( 'P'? num|4| )
faultCode 'fault code' = $num|5|
faultDescCode 'fault description code' = $num|3|

freezeFrame
  = _|13| 'Freeze Frame:' eol
    _|20| 'Fault Status:' _ status:$bin|8| eol
    _|20| 'Fault Priority:' _ priority:num eol
    _|20| 'Fault Frequency:' _ frequency:$num+ eol
    _|20| 'Reset counter:' _ resetCounter:$num+ eol
    _|20| 'Mileage:' _ mileage:$num+ _ mileageUnit:( 'km' / 'miles' ) eol
    _|20| 'Time Indication:' _ timeIndication:$num eol
l
  {
    return {
      status,
      priority: integer(priority),
      frequency: integer(frequency),
      resetCounter: integer(resetCounter),
      mileage: integer(mileage),
      mileageUnit,
      timeIndication
    }
  }


dashLine 'a dash line' = '-'+ eol

num 'a numeric character' = [0-9]
hexa 'an hexadecimal character' = [0-9A-F]
bin 'a binary character' = [01]
upp 'an uppercase alphabetic character' = [A-Z]
uppnum 'an alphanumeric uppercase character' = [0-9A-Z]

_ 'a blank space' = ' '
w 'a word' = [^ \r\n]+
l 'an empty line' = _* eol
eol 'the end of line' = '\r\n' // Those reports are produced under Windows
rol 'the rest of line' = [^\r]*
