/**
 * VCDS report.
 * @module
 */

class Report {
  date
  duration
  shop
  software
  vehicle
  modules
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

/**
 * A vehicle information.
 */
class Vehicle {
  vin
  licensePlate
  chassis
  type
  mileage
}

class Mileage {
  km
  miles
}

class Module {
  address
  name
  isReachable
  status

  info

  subsystems
  faults

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

/**
 * A VAG part number.
 *
 * @see https://blog.europaparts.com/audi-vw-part-numbers-demystified/
 */
class PartNumber {
  type
  group
  subgroup
  number
  modification

  toString () {
    return [
      this.type,
      this.group + this.subgroup,
      this.number,
      this.modification
    ].join(' ')
  }
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

  freezeFrame
}

class FreezeFrame {
  status
  priority
  frequency
  resetCounter
  mileage
  timeIndication
}

export { Duration, Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, PartNumber, Report, Software, Subsystem, Vehicle }
