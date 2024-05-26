/* Peggy grammar to parse VSCD auto-scan reports. */


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

  function binary(str) {
    return parseInt(str, 2)
  }

  const KM_TO_MILES = 0.62137119223733

  const milesFromKm = value => Math.trunc(value * KM_TO_MILES)

  const kmFromMiles = value => Math.trunc(value / KM_TO_MILES)
}}

{
}

start
  = report

report // A complete VCDS report
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
    'VIN:' _ vin _+ 'Mileage:' _ km:$dec+ 'km' '-' miles:$dec+ 'miles' eol
    l
    modulesStatus:moduleStatus+
    l+
    modulesInfos:moduleInfo+
    'End' '-'+ '(Elapsed Time:' _ duration:duration ')' '-'+ '\r\n'

  {
    const mappedInfos = new Map()

    modulesInfos.forEach(infos => {
      mappedInfos.set(infos.address, infos)
    });

    const modules = modulesStatus
      .filter(status => status.address !== '00') // Remove special module 00 for now
      .map(status => Object.assign(
        status,
        mappedInfos.get(status.address)
      ))

    return {
      date,
      duration,
      shop,
      software: {
        version,
        platform,
        dataVersion,
        dataDate
      },
      vehicle: {
        vin,
        licensePlate,
        chassis,
        type,
        mileage: {
          km: integer(km),
          miles: integer(miles)
        }
      },
      modules
    }
  }

moduleStatus // A module status line
  = address:moduleAddress '-' name:$[^-]+ '--' _ 'Status:' _ description:$[^01]+ flags:$bin|4| eol
  {
    return {
      address,
      name: string(name),
      status: {
        flags: binary(flags),
        description: string(description)
      }
    }
  }

moduleInfo // A module information section
  = dashLine
    'Address' _ address:moduleAddress ':'
      info:(
          [^\r]+ // ignore module name
          eol
          'Cannot be reached' eol
          {
            return {
              address,
              isReachable: false,
              info: null,
              subsystems: [],
              faults: []
            }
          }
      /
          [^:]+ // ignore module name
          ':'
          '.'? // this dot '.' just after the colon ':' may be a bug
          _ labelsFile:$rol
          eol

        _|3| partNumber:(
            'Part No:' _ hardware:partNumber
            { return { software: null, hardware } }
            /
            'Part No' _ 'SW:' _ software:partNumber _+ 'HW:' _ hardware:( partNumber / 'Hardware No' { return null } ) rol // 'Hardware No' value may be a bug
            { return { software, hardware } }
          ) eol
        _|3| 'Component:' _ component:$rol eol
        revision:( _|3| 'Revision:' _ @$w _+ )?
          serial:( 'Serial number:' _ @$w eol )?
        codingValue:( _|3| 'Coding:' _ @codingValue eol )?
        _|3| 'Shop #:' _ 'WSC' _ codingWsc:shopWsc eol
        _|3| 'VCID:' _ vcid:vcid eol
        vinid:( _|3| 'VINID:' _ @vinid eol )?
        l
        subsystems:subsystem*
        faults:faultsSection
        readiness:( 'Readiness:' _ @readiness eol )?
        {
          return {
            address,
            isReachable: true,
            info: {
              labelsFile,
              partNumber,
              component: string(component),
              revision,
              serial,
              coding: {
                value: codingValue,
                wsc: codingWsc
              },
              vcid,
              vinid,
              readiness
            },
            subsystems,
            faults
          }
        }
      )
    l
    { return info }

subsystem // A module subsystem
  = _|3| 'Subsystem' _ index:$dec+ _ '-' _ 'Part No:' _ partNumber:partNumber labelsFile:( _+ 'Labels:' _ @$rol )? eol
    _|3| 'Component:' _ component:$rol eol
    coding:( _|3| 'Coding:' _ @codingValue eol )?
    wsc:( _|3| 'Shop #: WSC' _ @shortWsc rol eol )?
    ( [A-Z0-9 ]i+ eol )? // ignore this line as it contains the same info as above
    l
  {
    return {
      index: integer(index),
      partNumber,
      component: string(component),
      labelsFile,
      coding,
      wsc
    }
  }

faultsSection // The module information section showing faults
  = (
    'No fault code found.' eol
    { return [] }
    /
    [1-9][0-9]* _ 'Fault' 's'? _ 'Found:' eol
    faults:fault+
    { return faults }
  )

fault // A module fault information
  = vagCode:vagCode _ '-' _ subject:$rol eol
    _|12| odbCode:(@odbCode _ '-' _)? symptomCode:symptomCode _ '-' _ description:$rol eol
    freezeFrame:(freezeFrame)?
  {
    return {
      subject: string(subject),
      code: {
        odb2: odbCode,
        vag: vagCode
      },
      symptom: {
        code: symptomCode,
        description
      },
      freezeFrame
    }
  }

freezeFrame // A fault freeze frame
  = _|13| 'Freeze Frame:' eol
    _|20| 'Fault Status:' _ status:$bin|8| eol
    _|20| 'Fault Priority:' _ priority:dec eol
    _|20| 'Fault Frequency:' _ frequency:$dec+ eol
    _|20| 'Reset counter:' _ resetCounter:$dec+ eol
    _|20| 'Mileage:' _ value:$dec+
      _ mileage:(
        'km' { return { km: integer(value), miles: milesFromKm(value) } }
      /
        'miles' { return { miles: integer(value), km: kmFromMiles(value) } }
      ) eol
    _|20| 'Time Indication:' _ timeIndication:$dec eol
l
  {
    return {
      status,
      priority: integer(priority),
      frequency: integer(frequency),
      resetCounter: integer(resetCounter),
      mileage,
      timeIndication: integer(timeIndication)
    }
  }

/***************************** AUTOMOTIVE RULES *******************************/
vin 'a VIN (Vehicule Identification Number)'
  = $uppnum|17|
licensePlate 'a license plate number'
  = $[A-Z0-9-]+
odbCode 'ODB2 fault code' = $( 'P'? dec|4| )

/******************************** VAG RULES ***********************************/
chassis 'a VAG chassis code'
  = @$uppnum|2|
type 'a VAG vehicle, engine or transmission type code'
  = @$uppnum|3|
shopWsc 'a WSC (WorkShop Code)' = $( shortWsc _ dec|3| _ dec|5| )
shortWsc 'a short WSC (WorkShop Code)' = $dec|5|
vagCode 'VAG fault code' = $dec|5|
symptomCode 'fault symptom code' = $dec|3|

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
  = type:type _ group:partGroup subgroup:partSubgroup _ number:partSpecNumber modificationCode:(_ @partModifCode)?
  { return text() }
partGroup 'the main group of a part number' = dec
partSubgroup 'the subgroup of a part number' = $dec|2|
partSpecNumber 'the specific number of a part' = $dec|3|
partModifCode 'the modification code of a part number' = upp

/******************************** VCDS RULES **********************************/
versionSpecifier 'a version specifier'
  = $( dec+ '.' dec+ '.' dec+ '.' dec+ )
dataVersionDate 'a VCDS data version date'
  = $dec|8|
dataVersionSpecifier 'a VCDS data version specifier'
  = $( 'DS' dec|3| '.' dec )

moduleAddress 'a module address' = $hexa|2|
codingValue 'a coding value' = $hexa+
vcid 'a VCID (Vag-Com identifier)' = $( hexa|18| '-' hexa|4| )
vinid 'a VINID' = $hexa|34|
readiness 'readiness flags' = $( bin|4| _ bin|4| )

/**************************** MISCELANEOUS RULES ******************************/
dashLine 'a dash line' = '-'+ eol

/**************************** DATE AND TIME RULES *****************************/
datetime
  = dayName ',' day ',' monthName ',' year ',' hours ':' minutes ':' seconds ':00009'
  { return new Date(text()) }
duration
  = minutes:$minutes ':' seconds:$seconds
  { return { minutes: integer(minutes), seconds: integer(seconds) } }
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

/******************************* GENERIC RULES ********************************/
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
