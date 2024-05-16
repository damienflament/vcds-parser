/**
 * Data model.
 * @module
 */

import { typeOf } from './object.js'

/**
 * Fills the given array with the given data.
 *
 * The array must contain a single element which must be a class object. That
 * element is taken off to be used as a template. Each element from the data
 * array is assigned to a new instance of the template.
 *
 * @param {array} array
 * @param {array} data
 */
const safelyFillArray = (array, data) => {
  const Template = array.pop()

  for (const element of data) {
    const object = new Template()
    safelyAssign(object, element)
    array.push(object)
  }

  Object.freeze(array)
}

/**
 * Assigns the given data to the given object's properties.
 *
 * Object composition is allowed through the initialization of class field. If
 * the field is a class object, the data is assigned to a new instance of this
 * class. If it is an array containing a single class object, each data element
 * is assigned to a new instance of the class.
 *
 * Before assigning, the object is sealed to prevent new property creation.
 * After assigning, the object is frozen.
 *
 * @param {object} object
 * @param {object} data
 */
const safelyAssign = (object, data) => {
  Object.seal(object)

  for (const name in data) {
    const datum = data[name]

    switch (typeOf(object[name])) {
      // The field is a class, assign data to a new instance. Null value is
      // allowed.
      case 'Function':
        if (datum === null) {
          object[name] = null
        } else {
          object[name] = new object[name]()
          safelyAssign(object[name], datum)
        }
        break
      // The field is an array, fill it.
      case 'Array':
        safelyFillArray(object[name], datum)
        break
      // The field is a primitive, assign it.
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
   *
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
