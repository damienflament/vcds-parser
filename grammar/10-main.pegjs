// Peggy grammar to parse VSCD auto-scan reports

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
    //                           ▲ Taken from user input.
    //                             Any character can be used.
    l
    'VIN:' _ vin:Vin _+ 'License Plate:' _ licensePlate:($LicensePlate)? EOL
    l+
    'Chassis Type:' _ chassis:Chassis _ '(' type:Type ')' EOL
    'Scan:' rol EOL // ignore module addresses list
    l
    'VIN:' _ Vin _+ 'Mileage:' _ km:Integer 'km' '-' miles:Integer 'miles' EOL
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
        mappedInfos.get(s.address)
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
          km,
          miles: miles
        }
      },
      modules
    }
  }

ModuleStatus                                                                    // A module status line
  = address:ModuleAddress '-' name:Label _ '--' _ 'Status:' _ description:ModuleStatusLabel _ flags:$BIN|4| EOL
  {
    return {
      address,
      name,
      status: {
        flags: binary(flags),
        description
      }
    }
  }

ModuleInfoSection                                                               // A module information section
  = DashLine
    @(UnreachableModuleInfo / ModuleInfo)
    l

UnreachableModuleInfo                                                           // The almost empty information section content related to and unreachable module
  = 'Address' _ address:ModuleAddress ':' _ Label EOL
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
  = 'Address' _ address:ModuleAddress ':' _ Label _+ 'Labels:' '.'? _ labelsFile:Filename EOL
    //                                  This dot '.' just after ▲
    //                                  the colon ':' may be a
    //                                  bug
                  _|3| partNumber:ModuleInfoPartNumber EOL
                  _|3| 'Component:' _ component:$rol EOL
    // The component label and reference are      ▲
    // messed up. Take everything.
    revAndSerial:(_|3| 'Revision:' _ @$UPPNUM+ _+ 'Serial number:' _ @$UPPNUM+ EOL)?
          coding:(_|3| 'Coding:' _ @CodingValue EOL)?
                  _|3| 'Shop #:' _ 'WSC' _ wsc:Wsc EOL
                  _|3| 'VCID:' _ vcid:Vcid EOL
           vinid:(_|3| 'VINID:' _ @Vinid EOL)?
                  l
       subsystems:Subsystem*
           faults:FaultsSection
       readiness:('Readiness:' _ @Readiness EOL)?
    {
      const [revision, serial] = revAndSerial ?? [null, null]

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
  = (                                                                           // can apply to hardware or both hardware and software
      'Part No:' _ hardware:PartNumber
      { return { software: null, hardware } }
    /
      'Part No' _ 'SW:' _ software:PartNumber _+ 'HW:' _ hardware:(PartNumber / BuggyHardwarePartNumber) rol
      { return { software, hardware } }
    )

BuggyHardwarePartNumber
  = 'Hardware No' // 'Hardware No' value may be a bug
  { return null }

Subsystem                                                                       // A module subsystem
  =          _|3| 'Subsystem' _ index:Integer _ '-' _ 'Part No:' _ partNumber:PartNumber labelsFile:(_+ 'Labels:' _ @Filename)? EOL
             _|3| 'Component:' _ component:$rol EOL // The component label and
                                                    // references are messed up.
                                                    // Take everything.
     coding:(_|3| 'Coding:' _ @CodingValue EOL)?
        wsc:(_|3| 'Shop #: WSC' _ @ShortWsc _+ EOL)?
            ([A-Z0-9 ]i+ EOL)? // ignore this last line as it contains the same
                               // info as above (part number and component)
             l
    {
      return {
        index,
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
      '1 Fault Found:' EOL
      fault:Fault
      { return [fault] }
    /
      Integer _ 'Faults Found:' EOL
      @faults:Fault+
    )

Fault                                                                           // A module fault
  = vagCode:VagCode _ '-' _ subject:FaultSubject _ EOL
    _|12| detail:FaultDetail EOL
    freezeFrame:(FreezeFrame)?
  {
    const { odbCode, symptom, isIntermittent } = detail

    return {
      subject: string(subject),
      code: {
        odb2: odbCode,
        vag: vagCode
      },
      symptom,
      isIntermittent,
      freezeFrame
    }
  }

FaultSubject = $([0-9a-z/,.;()-]i+)|1.., ' '| // This label may contain '-' which
                                              // is a delimiter for other labels

FaultDetail                                                                     // Detail about the fault
  = odbCode:(@OdbCode _ '-' _)? symptomCode:SymptomCode _ '-' _ label:(Label / BuggySymptomLabel) intermittency:(_ '-' _ @FaultIntermittency)?
  {
    return {
      odbCode,
      symptom: {
        code: symptomCode,
        label
      },
      isIntermittent: boolean(intermittency),
    }
  }

BuggySymptomLabel 'a buggy symptom label' = '-' { return null }

FaultIntermittency = 'Intermittent' { return true }

FreezeFrame                                                                     // A fault freeze frame
  =        _|13| 'Freeze Frame:' EOL
           _|20| 'Fault Status:' _ status:$BIN|8| EOL
           _|20| 'Fault Priority:' _ priority:Integer EOL
           _|20| 'Fault Frequency:' _ frequency:Integer EOL
           _|20| 'Reset counter:' _ resetCounter:Integer EOL
           _|20| 'Mileage:' _ mileage:Integer _ 'km' EOL
           _|20| 'Time Indication:' _ timeIndication:Integer EOL
frameDate:(_|20| 'Date:' _ @$(Year '.' Month '.' Day) EOL)?
frameTime:(_|20| 'Time:' _ @$(Hours ':' Minutes ':' Seconds) EOL)?
    (
           l
           _|13| 'Freeze Frame:' EOL
    )?
  voltage:(_|20| 'Voltage:' _ @Decimal _ 'V' EOL)?
    temp1:(_|20| 'Temperature:' _ @Decimal '�C' EOL)?
          (_|20| '(no units):' rol EOL)?
          (_|20| '(no units):' rol EOL)?
    temp2:(_|20| 'Temperature:' _ @Decimal '�C' EOL)?
      l
  {
    const frameDatetime = (frameDate === null || frameTime === null)
      ? null
      : `${frameDate} ${frameTime}`

    return {
      status,
      priority,
      frequency,                                                                // number of occurences since the first one
      resetCounter,
      mileage: {                                                                // mileage of the first occurence
        km: mileage,
        miles: milesFromKm(mileage)
      },
      date: date(frameDatetime),
      timeIndication: timeIndication,
      voltage,
      temperature1: temp1,
      temperature2: temp2
    }
  }

DashLine 'a dash line' = '-'+ EOL

Label 'a label'
  = $([0-9a-z/,.]i+)|1.., ' '|
