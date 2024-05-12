/**
 * Data model.
 * @module
 */

import { typeOf } from './object.js'

const safelyFillArray = (array, data) => {
  const Template = array.pop()

  for (const element of data) {
    const object = new Template()
    safelyAssign(object, element)
    array.push(object)
  }

  Object.freeze(array)
}

const safelyAssign = (object, data) => {
  Object.seal(object)

  for (const name in data) {
    const datum = data[name]

    switch (typeOf(object[name])) {
      case 'Function':
        if (datum === null) {
          object[name] = null
        } else {
          object[name] = new object[name]()
          safelyAssign(object[name], datum)
        }
        break
      case 'Array':
        safelyFillArray(object[name], datum)
        break
      default:
        object[name] = datum
    }
  }

  Object.freeze(object)
}

/** A VCDS auto-scan report */
class AutoScan {
  date
  duration = Duration
  shop
  software = Software
  vehicle = Vehicle
  modules = [Module]
}

class Duration {
  minutes
  seconds
}

class Software {
  version
  platform
  dataVersion
  dataDate
}

class Vehicle {
  vin
  licensePlate
  chassis
  type
  mileage = Mileage
}

/** A travelled distance expressed in kilometers and miles */
class Mileage {
  km
  miles
}

class Module {
  address
  name
  isReachable
  status = ModuleStatus
  info = ModuleInfo
  subsystems = [Subsystem]
  faults = [Fault]

  /**
   * Gives the decimal form of the given module address.
   * @param {string} address the module address
   * @returns {integer}
   */
  static decimalAddress (address) {
    return Number.parseInt(address)
  }

  /** @type {integer} */
  get decimalAddress () {
    return Module.decimalAddress(this.address)
  }

  /** @type {boolean} */
  get isFaulty () {
    return !this.status.isWorking
  }
}

class ModuleStatus {
  flags
  description

  static OK = 0b0000 // OK
  static MALFUNCTION = 0b0010 // Malfunction
  static UNREACHABLE = 0b1100 // Cannot be reached
  static COM_ERROR = 0b1000 // Sporadic communication error

  get isWorking () {
    return this.flags === ModuleStatus.OK
  }
}

class ModuleInfo {
  labelsFile

  partNumber = {
    software: null,
    hardware: null
  }

  component
  revision
  serial
  coding
  codingWsc
  vcid
  vinid
  readiness
}

class Subsystem {
  index
  partNumber
  component
  labelsFile
  coding
  codingWsc
}

class Fault {
  code
  subject
  errorCode
  descriptionCode
  description

  freezeFrame = FreezeFrame
}

class FreezeFrame {
  status
  priority
  frequency
  resetCounter
  mileage = Mileage
  timeIndication
}

export { AutoScan, Duration, Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, Software, Subsystem, Vehicle, safelyAssign }
