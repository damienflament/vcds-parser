/* Peggy grammar to parse VSCD auto-scan reports. */

{{
  function string(str) {
    if (str === null) return null

    str = str.trim()

    if (str.length === 0) str = null

    return str
  }

  function integer(str) {
    return str === null
      ? null
      : Number.parseInt(str)
  }

  function float(str) {
    return str === null
      ? null
      : Number.parseFloat(str)
  }

  function binary(str) {
    return str === null
      ? null
      : Number.parseInt(str, 2)
  }

  function date(str) {
    return str === null
      ? null
      : new Date(str)
  }

  const KM_TO_MILES = 0.62137119223733

  const milesFromKm = value => Math.trunc(value * KM_TO_MILES)

  const kmFromMiles = value => Math.trunc(value / KM_TO_MILES)
}}

{
}

start
  = Report

Report                                                                          // A complete VCDS report
  = date:Datetime EOL
    'VCDS -- Windows Based VAG/VAS Emulator Running on Windows 10 x64' EOL
    'VCDS Version:' _ version:VersionSpecifier _ '(' platform:('x64') ')' EOL
    'Data version:' _ dataDate:DataVersionDate _ dataVersion:DataVersionSpecifier EOL
    'www.Ross-Tech.com' EOL
    l
    'Dealer/Shop Name:' _ shop:$rol EOL
    l
    'VIN:' _ vin:Vin _+ 'License Plate:' _ licensePlate:( $LicensePlate )? EOL
    l+
    'Chassis Type:' _ chassis:Chassis _ '(' type:Type ')' EOL
    'Scan:' rol EOL // ignore module addresses list
    l
    'VIN:' _ Vin _+ 'Mileage:' _ km:$DEC+ 'km' '-' miles:$DEC+ 'miles' EOL
    l
    modulesStatus:ModuleStatus+
    l+
    modulesInfos:ModuleInfoSection+
    'End' '-'+ '(Elapsed Time:' _ duration:Duration ')' '-'+ EOL

  {
    const mappedInfos = new Map()

    modulesInfos.forEach(infos => {
      mappedInfos.set(infos.address, infos)
    });

    const modules = modulesStatus
      .filter(s => s.address !== '00') // Remove special module 00 for now
      .map(s => Object.assign(
        s,
        mappedInfos.get(s .address)
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

ModuleStatus                                                                    // A module status line
  = address:ModuleAddress '-' name:$[^-]+ '--' _ 'Status:' _ description:$NOT_BIN+ flags:$BIN|4| EOL
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

ModuleInfoSection                                                               // A module information section
  = DashLine
    @( UnreachableModuleInfo / ModuleInfo )
    l

UnreachableModuleInfo                                                           // The almost empty information section content related to and unreachable module
  = 'Address' _ address:ModuleAddress ':' rol EOL
    //                  ignore module name ▲
    'Cannot be reached' EOL
    {
      return {
        address,
        isReachable: false,
        info: null,
        subsystems: [],
        faults: []
      }
    }

ModuleInfo                                                                      // The module information section content
  = 'Address' _ address:ModuleAddress ':' [^:]+ ':' '.'? _ labelsFile:$rol EOL
    //                   ignore module name ▲        ▲ this dot '.' just after
    //                                                 the colon ':' may be a
    //                                                 bug
                    _|3| partNumber:ModuleInfoPartNumber EOL
                    _|3| 'Component:' _ component:$rol EOL
revisionAndSerial:( _|3| 'Revision:' _ @$UPPNUM+ _+ 'Serial number:' _ @$UPPNUM+ EOL )?
           coding:( _|3| 'Coding:' _ @CodingValue EOL )?
                    _|3| 'Shop #:' _ 'WSC' _ wsc:Wsc EOL
                    _|3| 'VCID:' _ vcid:Vcid EOL
            vinid:( _|3| 'VINID:' _ @Vinid EOL )?
                    l
     subsystems:Subsystem*
         faults:FaultsSection
    readiness:( 'Readiness:' _ @Readiness EOL )?
    {
      const [revision, serial] = revisionAndSerial ?? [null, null]

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
            value: coding,
            wsc
          },
          vcid,
          vinid,
          readiness
        },
        subsystems,
        faults
      }
    }

ModuleInfoPartNumber                                                            // The module part number
  = (                                                                           //can apply to hardware or both hardware and software
      'Part No:' _ hardware:PartNumber
      { return { software: null, hardware } }
    /
      'Part No' _ 'SW:' _ software:PartNumber _+ 'HW:' _ hardware:( PartNumber / BuggyHardwarePartNumber ) rol
      { return { software, hardware } }
    )

BuggyHardwarePartNumber
  = 'Hardware No' // 'Hardware No' value may be a bug
  { return null }

Subsystem                                                                       // A module subsystem
  =          _|3| 'Subsystem' _ index:$DEC+ _ '-' _ 'Part No:' _ partNumber:PartNumber labelsFile:( _+ 'Labels:' _ @$rol )? EOL
             _|3| 'Component:' _ component:$rol EOL
    coding:( _|3| 'Coding:' _ @CodingValue EOL )?
       wsc:( _|3| 'Shop #: WSC' _ @ShortWsc rol EOL )?
           ( [A-Z0-9 ]i+ EOL )? // ignore this last line as it contains the same
                                // info as above (part number and component)
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

FaultsSection                                                                   // The module information section showing faults
  = (
      'No fault code found.' EOL
      { return [] }
    /
      ( '1 Fault Found:' / DEC+ _ 'Faults Found:' ) EOL
      faults:Fault+
      { return faults }
  )

Fault                                                                           // A module fault information
  = vagCode:VagCode _ '-' _ subject:$rol EOL
    _|12| odbCode:(@OdbCode _ '-' _)? symptomCode:SymptomCode _ '-' _ description:$rol EOL
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

FreezeFrame                                                                     // A fault freeze frame
  =   _|13| 'Freeze Frame:' EOL
      _|20| 'Fault Status:' _ status:$BIN|8| EOL
      _|20| 'Fault Priority:' _ priority:DEC EOL
      _|20| 'Fault Frequency:' _ frequency:$DEC+ EOL
      _|20| 'Reset counter:' _ resetCounter:$DEC+ EOL
      _|20| 'Mileage:' _ mileage:$DEC+ _ 'km' EOL
      _|20| 'Time Indication:' _ timeIndication:$DEC EOL
frameDate:( _|20| 'Date:' _ @$( Year '.' Month '.' Day ) EOL )?
frameTime:( _|20| 'Time:' _ @$( Hours ':' Minutes ':' Seconds ) EOL )?
     (
       l
       _|13| 'Freeze Frame:' EOL
     )?
voltage:( _|20| 'Voltage:' _ @Decimal _ 'V' EOL )?
temperature1:( _|20| 'Temperature:' _ @Decimal '�C' EOL )?
      ( _|20| '(no units):' rol EOL )?
      ( _|20| '(no units):' rol EOL )?
temperature2:( _|20| 'Temperature:' _ @Decimal '�C' EOL )?
      l
  {
    const frameDatetime = (frameDate === null || frameTime === null)
      ? null
      : `${frameDate} ${frameTime}`

    return {
      status,
      priority: integer(priority),
      frequency: integer(frequency),                                            // number of occurences since the first one
      resetCounter: integer(resetCounter),
      mileage: {                                                                // mileage of the first occurence
        km: integer(mileage),
        miles: milesFromKm(mileage)
      },
      date: date(frameDatetime),
      timeIndication: integer(timeIndication),
      voltage: float(voltage),
      temperature1: float(temperature1),
      temperature2: float(temperature2)
    }
  }

/***************************** AUTOMOTIVE RULES *******************************/
Vin 'a VIN (Vehicule Identification Number)'
  = $UPPNUM|17|
LicensePlate 'a license plate number'
  = $[A-Z0-9-]+
OdbCode 'ODB2 fault code' = $( 'P'? DEC|4| )

/******************************** VAG RULES ***********************************/
Chassis 'a VAG chassis code'
  = @$UPPNUM|2|
Type 'a VAG vehicle, engine or transmission Type code'
  = @$UPPNUM|3|
Wsc 'a WSC (WorkShop Code)' = $( ShortWsc _ DEC|3| _ DEC|5| )
ShortWsc 'a short WSC (WorkShop Code)' = $DEC|5|
VagCode 'VAG fault code' = $DEC|5|
SymptomCode 'fault symptom code' = $DEC|3|

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
PartGroup 'the main group of a part number' = DEC
PartSubgroup 'the subgroup of a part number' = $DEC|2|
PartSpecNumber 'the specific number of a part' = $DEC|3|
PartModifCode 'the modification code of a part number' = UPP

/******************************** VCDS RULES **********************************/
VersionSpecifier 'a version specifier'
  = $( DEC+ '.' DEC+ '.' DEC+ '.' DEC+ )
DataVersionDate 'a VCDS data version date'
  = $DEC|8|
DataVersionSpecifier 'a VCDS data version specifier'
  = $( 'DS' DEC|3| '.' DEC )

ModuleAddress 'a module address' = $HEX|2|
CodingValue 'a coding value' = $HEX+
Vcid 'a VCID (Vag-Com identifier)' = $( HEX|18| '-' HEX|4| )
Vinid 'a VINID' = $HEX|34|
Readiness 'readiness flags' = $( BIN|4| _ BIN|4| )

/**************************** MISCELANEOUS RULES ******************************/
DashLine 'a dash line' = '-'+ EOL

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
  = $( '0'[1-9] / [12][0-9] / '3'[01] )
Month 'a month number'
  = $( '0'[1-9] / '1'[0-2] )
MonthName 'the name of a month'
  = 'January' / 'February' / 'March' / 'April' / 'May' / 'June' / 'July' /
    'August' / 'September' / 'October' / 'November' / 'December'
Year 'a year'
  = $( [12][0-9]|3| )
Hours 'hours'
  = $( [01][0-9] / '2'[0-3] )
Minutes 'minutes'
  = $( [0-5][0-9] )
Seconds 'seconds'
  = $( [0-5][0-9] )

Decimal 'a decimal number'
  = $( DEC+ '.' DEC+ )

/********************************* HELPERS ************************************/
w 'a word' = [^ \r\n]+
l 'an empty line' = _* EOL
rol 'the rest of the line' = [^\r]*

/********************************* TOKENS *************************************/
_ 'a blank space' = ' '
DEC 'a decimal character' = [0-9]
HEX 'an hexadecimal character' = [0-9A-F]
BIN 'a binary character' = [01]
UPP 'an uppercase alphabetic character' = [A-Z]
UPPNUM 'an alphanumeric uppercase character' = [0-9A-Z]

NOT_BIN 'a not binary character' = [^01]

EOL 'the end of the line' = '\r\n' // Those reports are produced under Windows
