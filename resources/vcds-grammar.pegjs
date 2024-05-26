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
  = Report

Report // A complete VCDS report
  = date:Datetime eol
    'VCDS -- Windows Based VAG/VAS Emulator Running on Windows 10 x64' eol
    'VCDS Version:' _ version:VersionSpecifier _ '(' platform:('x64') ')' eol
    'Data version:' _ dataDate:DataVersionDate _ dataVersion:DataVersionSpecifier eol
    'www.Ross-Tech.com' eol
    l
    'Dealer/Shop Name:' _ shop:$rol eol
    l
    'VIN:' _ vin:Vin _+ 'License Plate:' _ licensePlate:( $LicensePlate )? eol
    l+
    'Chassis Type:' _ chassis:Chassis _ '(' type:Type ')' eol
    'Scan:' rol eol // ignore module addresses list
    l
    'VIN:' _ Vin _+ 'Mileage:' _ km:$dec+ 'km' '-' miles:$dec+ 'miles' eol
    l
    modulesStatus:ModuleStatus+
    l+
    modulesInfos:ModuleInfo+
    'End' '-'+ '(Elapsed Time:' _ duration:Duration ')' '-'+ '\r\n'

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

ModuleStatus // A module status line
  = address:ModuleAddress '-' name:$[^-]+ '--' _ 'Status:' _ description:$[^01]+ flags:$bin|4| eol
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

ModuleInfo // A module information section
  = DashLine
    'Address' _ address:ModuleAddress ':'
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
            'Part No:' _ hardware:PartNumber
            { return { software: null, hardware } }
            /
            'Part No' _ 'SW:' _ software:PartNumber _+ 'HW:' _ hardware:( PartNumber / 'Hardware No' { return null } ) rol // 'Hardware No' value may be a bug
            { return { software, hardware } }
          ) eol
        _|3| 'Component:' _ component:$rol eol
        revision:( _|3| 'Revision:' _ @$w _+ )?
          serial:( 'Serial number:' _ @$w eol )?
        codingValue:( _|3| 'Coding:' _ @CodingValue eol )?
        _|3| 'Shop #:' _ 'WSC' _ codingWsc:Wsc eol
        _|3| 'VCID:' _ vcid:Vcid eol
        vinid:( _|3| 'VINID:' _ @Vinid eol )?
        l
        subsystems:Subsystem*
        faults:FaultsSection
        readiness:( 'Readiness:' _ @Readiness eol )?
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

Subsystem // A module subsystem
  = _|3| 'Subsystem' _ index:$dec+ _ '-' _ 'Part No:' _ partNumber:PartNumber labelsFile:( _+ 'Labels:' _ @$rol )? eol
    _|3| 'Component:' _ component:$rol eol
    coding:( _|3| 'Coding:' _ @CodingValue eol )?
    wsc:( _|3| 'Shop #: WSC' _ @ShortWsc rol eol )?
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

FaultsSection // The module information section showing faults
  = (
    'No fault code found.' eol
    { return [] }
    /
    [1-9][0-9]* _ 'Fault' 's'? _ 'Found:' eol
    faults:Fault+
    { return faults }
  )

Fault // A module fault information
  = vagCode:VagCode _ '-' _ subject:$rol eol
    _|12| odbCode:(@OdbCode _ '-' _)? symptomCode:SymptomCode _ '-' _ description:$rol eol
    freezeFrame:(FreezeFrame)?
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

FreezeFrame // A fault freeze frame
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
Vin 'a VIN (Vehicule Identification Number)'
  = $uppnum|17|
LicensePlate 'a license plate number'
  = $[A-Z0-9-]+
OdbCode 'ODB2 fault code' = $( 'P'? dec|4| )

/******************************** VAG RULES ***********************************/
Chassis 'a VAG chassis code'
  = @$uppnum|2|
Type 'a VAG vehicle, engine or transmission Type code'
  = @$uppnum|3|
Wsc 'a WSC (WorkShop Code)' = $( ShortWsc _ dec|3| _ dec|5| )
ShortWsc 'a short WSC (WorkShop Code)' = $dec|5|
VagCode 'VAG fault code' = $dec|5|
SymptomCode 'fault symptom code' = $dec|3|

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
PartNumber 'a part number'
  = type:Type _ group:PartGroup subgroup:PartSubgroup _ number:PartSpecNumber modificationCode:(_ @PartModifCode)?
  { return text() }
PartGroup 'the main group of a part number' = dec
PartSubgroup 'the subgroup of a part number' = $dec|2|
PartSpecNumber 'the specific number of a part' = $dec|3|
PartModifCode 'the modification code of a part number' = upp

/******************************** VCDS RULES **********************************/
VersionSpecifier 'a version specifier'
  = $( dec+ '.' dec+ '.' dec+ '.' dec+ )
DataVersionDate 'a VCDS data version date'
  = $dec|8|
DataVersionSpecifier 'a VCDS data version specifier'
  = $( 'DS' dec|3| '.' dec )

ModuleAddress 'a module address' = $hexa|2|
CodingValue 'a coding value' = $hexa+
Vcid 'a VCID (Vag-Com identifier)' = $( hexa|18| '-' hexa|4| )
Vinid 'a VINID' = $hexa|34|
Readiness 'readiness flags' = $( bin|4| _ bin|4| )

/**************************** MISCELANEOUS RULES ******************************/
DashLine 'a dash line' = '-'+ eol

/**************************** DATE AND TIME RULES *****************************/
Datetime
  = DayName ',' Day ',' MonthName ',' Year ',' Hours ':' Minutes ':' Seconds ':00009'
  { return new Date(text()) }
Duration
  = minutes:$Minutes ':' seconds:$Seconds
  { return { minutes: integer(minutes), seconds: integer(seconds) } }
DayName 'the name of a week day'
  = 'Monday' / 'Tuesday' / 'Wednesday' / 'Thursday' / 'Friday' / 'Saturday' /
    'Sunday'
Day 'a day number'
  = $([0-2][0-9] / '3'[0-1])
MonthName 'the name of a month'
  = 'January' / 'February' / 'March' / 'April' / 'May' / 'June' / 'July' /
    'August' / 'September' / 'October' / 'November' / 'December'
Year 'a year'
  = $[12][0-9]|3|
Hours 'hours'
  = $( [01][0-9] / '2'[0-3] )
Minutes 'minutes'
  = $[0-5][0-9]
Seconds 'seconds'
  = $[0-5][0-9]

/********************************* HELPERS ************************************/
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
