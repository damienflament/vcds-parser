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
  /** @type {string} */ softwareVersion = undefined
  /** @type {string} */ softwarePlatform = undefined
  /** @type {string} */ dataVersion = undefined
  /** @type {string} */ dataVersionDate = undefined

  /** @type {Date} */ date = undefined
  /** @type {Duration} */ duration = undefined
  /** @type {string?} */ shop = null

  /** @type {string} */ vin = undefined
  /** @type {string?} */ licensePlate = null
  /** @type {string} */ chassis = undefined
  /** @type {string} */ type = undefined
  /** @type {Mileage} */ mileage = undefined

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
  /** @type {integer} */ minutes = undefined
  /** @type {integer} */ seconds = undefined

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

  /** @type {integer} */ km = undefined
  /** @type {integer} */ miles = undefined

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

  /** @type {string} */ address = undefined
  /** @type {boolean} */ isReachable = undefined
  /** @type {string} */ name = undefined
  /** @type {ModuleStatus} */ status = undefined

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
  /** @type {string} */ flags = undefined
  /** @type {string} */ description = undefined

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
    super()
    Object.seal(this)
  }
}

/**
 * A module subsystem.
 */
class Subsystem extends Committable {
  /** @type {integer} */ index = undefined
  /** @type {string} */ partNumber = undefined
  /** @type {string} */ component = undefined

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
  /** @type {string} */ code = undefined
  /** @type {string} */ subject = undefined

  /** @type {string?} */ errorCode = null

  /** @type {string} */ descriptionCode = undefined
  /** @type {string} */ description = undefined

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
  /** @type {string} */ status = undefined
  /** @type {integer} */ priority = undefined
  /** @type {integer} */ frequency = undefined
  /** @type {integer} */ resetCounter = undefined
  /** @type {integer} */ mileage = undefined
  /** @type {string} */ timeIndication = undefined

  constructor () {
    super()
    Object.seal(this)
  }
}

export { Duration, Fault, FreezeFrame, Mileage, Module, ModuleInfo, ModuleStatus, Report, Subsystem }
