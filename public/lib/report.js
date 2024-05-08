/**
 * VCDS report.
 * @module
 */

/**
 * An object whose the data stucture can be checked and frozen.
 */
class Committable {
  /**
   * Ensures the data structure correctness.
   *
   * Throw a *TypeError* when an undefined property is encoutered. Finally,
   * freeze the object.
   */
  commit () {
    for (const name in this) {
      if (this[name] === undefined) {
        throw new TypeError(`Mandatory property ${name} undefined`)
      }
    }

    if (Object.isFrozen(this)) {
      throw new Error('Object already frozen')
    }

    Object.freeze(this)
  }
}

/**
 * A VCDS report.
 */
class Report extends Committable {
  /** @type {string} */ softwareVersion
  /** @type {string} */ softwarePlatform
  /** @type {string} */ dataVersion
  /** @type {string} */ dataVersionDate

  /** @type {Date} */ date
  /** @type {Duration} */ duration
  /** @type {string?} */ shop = null

  /** @type {string} */ vin
  /** @type {string?} */ licensePlate = null
  /** @type {string} */ chassis
  /** @type {string} */ type
  /** @type {Mileage} */ mileage

  constructor () {
    super()
    Object.seal(this)
  }

  /** @type {[Module]} */ modules = []

  /**
   * Adds a module to the report.
   * @param {Module} module
   */
  addModule (module) {
    this.modules[module.decimalAddress] = module
  }

  /**
   * Retrieves a module by its address.
   * @param {string} address the module address
   * @returns {Module}
   */
  getModule (address) {
    return this.modules[Module.decimalAddress(address)]
  }
}

class Duration extends Committable {
  /** @type {integer} */ minutes
  /** @type {integer} */ seconds

  constructor (minutes, seconds) {
    super()
    Object.seal(this)

    this.minutes = minutes
    this.seconds = seconds
  }
}

/**
 * A distance expressed in kilometers and miles.
 *
 * Designed to store two distance values in two different units, it can be
 * created using a static constructor when you get a value in a single unit.
 */
class Mileage extends Committable {
  static #KM_TO_MILES = 0.62137119223733

  /**
   * Creates a mileage from a distance in kilometers.
   * @param {integer} value a distance in kilometers
   * @returns {Mileage}
   */
  static fromKm (value) {
    return new Mileage(value, Math.trunc(value * Mileage.#KM_TO_MILES))
  }

  /**
   * Creates a mileage from a distance in miles.
   * @param {integer} value a distance in miles
   * @returns {Mileage}
   */
  static fromMiles (value) {
    return new Mileage(Math.trunc(value / Mileage.#KM_TO_MILES), value)
  }

  /** @type {integer} */ km
  /** @type {integer} */ miles

  /**
   * @param {integer} km a distance in kilometers
   * @param {integer} miles a distance in miles
   */
  constructor (km, miles) {
    super()
    Object.seal(this)

    this.km = km
    this.miles = miles
  }
}

/**
 * A vehicule control module.
 */
class Module extends Committable {
  /**
   * Gives the decimal form of the given module address.
   * @param {string} address the module address
   * @returns {integer}
   */
  static decimalAddress (address) {
    return Number.parseInt(address)
  }

  /** @type {string} */ address
  /** @type {boolean} */ isReachable
  /** @type {string} */ name
  /** @type {ModuleStatus} */ status

  /** @type {ModuleInfo?} */ info = null

  constructor () {
    super()
    Object.seal(this)
  }

  /** @type {integer} */
  get decimalAddress () {
    return Module.decimalAddress(this.address)
  }

  /** @type {boolean} */
  get isFaulty () {
    return Number.parseInt(this.status.flags, 2) !== 0
  }

  /** @type {[Subsystem]} */ subsystems = []

  /**
   * Adds a subsystem to the module.
   * @param {Subsystem} subsystem
   */
  addSubsystem (subsystem) {
    this.subsystems[subsystem.index - 1] = subsystem
  }

  /** @type {[Fault]} */ faults = []

  /**
   * Adds a fault to the module.
   * @param {Fault} fault
   */
  addFault (fault) {
    this.faults.push(fault)
  }
}

/**
 * The status of a module.
 */
class ModuleStatus extends Committable {
  /** @type {string} */ flags
  /** @type {string} */ description

  /**
   * @param {string} flags
   */
  constructor (flags) {
    super()
    Object.seal(this)

    this.flags = flags
  }
}

/**
 * Informations about a module.
 *
 * Stored in a separate object because unavailable when a module is unreachable.
 */
class ModuleInfo extends Committable {
  /** @type {string} */ labelsFile
  /** @type {string} */ partNumber
  /** @type {string} */ component
  /** @type {string} */ revision
  /** @type {string} */ serial
  /** @type {string} */ coding
  /** @type {string} */ codingWsc
  /** @type {string} */ vcid
  /** @type {string} */ vinid
  /** @type {string} */ readiness

  constructor () {
    super()
    Object.seal(this)
  }
}

/**
 * A module subsystem.
 */
class Subsystem extends Committable {
  /** @type {integer} */ index
  /** @type {string} */ partNumber
  /** @type {string} */ component

  /** @type {string?} */ labelsFile = null
  /** @type {string?} */ coding = null
  /** @type {string?} */ codingWsc = null

  constructor () {
    super()
    Object.seal(this)
  }
}

/**
 * A fault related to a control module.
 */
class Fault extends Committable {
  /** @type {string} */ code
  /** @type {string} */ subject

  /** @type {string?} */ errorCode = null

  /** @type {string} */ descriptionCode
  /** @type {string} */ description

  /** @type {FreezeFrame?} */ freezeFrame = null

  constructor () {
    super()
    Object.seal(this)
  }
}

/**
 * Information collected when a fault occurs.
 */
class FreezeFrame extends Committable {
  /** @type {string} */ status
  /** @type {integer} */ priority
  /** @type {integer} */ frequency
  /** @type {integer} */ resetCounter
  /** @type {integer} */ mileage
  /** @type {string} */ timeIndication

  constructor () {
    super()
    Object.seal(this)
  }
}

export { Duration, Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, Report, Subsystem }
