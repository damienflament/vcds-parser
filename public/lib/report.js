/**
 * VCDS report.
 * @module
 */

class Report {
  /** @type {string} */ softwareVersion = undefined
  /** @type {string} */ softwarePlatform = undefined
  /** @type {string} */ dataVersion = undefined
  /** @type {string} */ dataVersionDate = undefined

  /** @type {Date} */ date = undefined
  /** @type {string?} */ shop = null

  /** @type {string} */ vin = undefined
  /** @type {string?} */ licensePlate = null
  /** @type {string} */ chassis = undefined
  /** @type {Mileage} */ mileage = undefined

  constructor () {
    Object.preventExtensions(this)
  }

  /** @type {[Module]} */ #modules = []

  get modules () { return this.#modules }

  /**
   * Adds a module to the report.
   * @param {Module} module
   */
  addModule (module) {
    this.#modules[module.decimalAddress] = module
  }

  /**
   * Retrieves a module by its address.
   * @param {string} address the module address
   * @returns {Module}
   */
  getModule (address) {
    return this.#modules[Module.decimalAddress(address)]
  }
}

class Mileage {
  static #KM_TO_MILES = 0.62137119223733

  km = null
  miles = null

  constructor (km, miles) {
    this.km = km
    this.miles = miles

    Object.preventExtensions(this)
  }

  static fromKm (value) {
    return new Mileage(value, Math.trunc(value * Mileage.#KM_TO_MILES))
  }

  static fromMiles (value) {
    return new Mileage(Math.trunc(value / Mileage.#KM_TO_MILES), value)
  }
}
class Module {
  /** @type {string} */ address = undefined
  /** @type {boolean} */ isReachable = undefined
  /** @type {string} */ name = undefined
  /** @type {ModuleStatus} */ status = undefined

  /** @type {ModuleInfo?} */ info = null

  constructor (address) {
    this.address = address

    Object.preventExtensions(this)
  }

  /**
   * Return the decimal form of the given module address.
   *
   * @param {string} address the module address
   * @returns {integer}
   */
  static decimalAddress (address) {
    return Number.parseInt(address)
  }

  /**
   * The module decimal address.
  *
  * @type {integer}
  */
  get decimalAddress () {
    return Module.decimalAddress(this.address)
  }

  /**
   * Has the module any fault ?
   *
   * @type {boolean}
   */
  get isFaulty () {
    return Number.parseInt(this.status.flags, 2) !== 0
  }

  /** @type {[Subsystem]} */ #subsystems = []

  get subsystems () { return this.#subsystems }

  /**
   * Adds a subsystem to the module.
   * @param {Subsystem} subsystem
   */
  addSubsystem (subsystem) {
    this.#subsystems[subsystem.index - 1] = subsystem
  }

  /** @type {[Fault]} */ #faults = []

  get faults () { return this.faults }

  /**
   * Adds a fault to the module.
   * @param {Fault} fault
   */
  addFault (fault) {
    this.#faults.push(fault)
  }
}

class ModuleStatus {
  flags = undefined
  description = undefined

  constructor (flags) {
    this.flags = flags

    Object.preventExtensions(this)
  }
}

class ModuleInfo {
  /** @type {string} */ labelsFile = undefined
  /** @type {string} */ partNumber = undefined
  /** @type {string} */ component = undefined
  /** @type {string} */ revision = undefined
  /** @type {string} */ serial = undefined
  /** @type {string} */ coding = undefined
  /** @type {string} */ codingWsc = undefined
  /** @type {string} */ vcid = undefined
  /** @type {string} */ vinid = undefined
  /** @type {string} */ readiness = undefined

  constructor () {
    Object.preventExtensions(this)
  }
}

class Subsystem {
  /** @type {integer} */ index = undefined
  /** @type {string} */ partNumber = undefined
  /** @type {string} */ component = undefined

  /** @type {string?} */ labelsFile = null
  /** @type {string?} */ coding = null
  /** @type {string?} */ codingWsc = null

  constructor () {
    Object.preventExtensions(this)
  }
}

class Fault {
  /** @type {string} */ code = undefined
  /** @type {string} */ subject = undefined

  /** @type {string?} */ errorCode = null

  /** @type {string} */ descriptionCode = undefined
  /** @type {string} */ description = undefined

  /** @type {FreezeFrame?} */ freezeFrame = null

  constructor (code) {
    this.code = code

    Object.preventExtensions(this)
  }
}

class FreezeFrame {
  /** @type {string} */ status = undefined
  /** @type {integer} */ priority = undefined
  /** @type {integer} */ frequency = undefined
  /** @type {integer} */ resetCounter = undefined
  /** @type {integer} */ mileage = undefined
  /** @type {string} */ timeIndication = undefined

  constructor () {
    Object.preventExtensions(this)
  }
}

export { Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, Report, Subsystem }
