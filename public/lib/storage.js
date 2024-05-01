/**
 * Data storage.
 * @module
 */

import van from './van.js'

/**
 * Event emited when the storage can be accessed
 *
 * @event ready
 */

/**
 * A storage using an Indexed Database with a unique store.
 */
class Storage extends EventTarget {
  #DB_NAME = 'storage'
  #STORE_NAME = 'store'

  /** @type {IDBDatabase} */
  #db

  /**
   * Setups the IndexedDB database.
   *
   * @param {IDBFactory} factory an IndexedDB factory
   * @param {string} name the name of the database
   */
  #setupDatabase (factory) {
    const request = factory.open(this.#DB_NAME)

    request.onsuccess = ev => {
      this.#db = ev.target.result

      this.dispatchEvent(new Event('ready'))
    }

    request.onupgradeneeded = ev => {
      const db = ev.target.result

      db.createObjectStore(this.#STORE_NAME)
    }
  }

  /**
   * Returns the objects store within a transaction using the given mode.
   *
   * @param {IDBTransactionMode} mode the mode to open the transaction with
   */
  #getStore (mode) {
    const transaction = this.#db.transaction(this.#STORE_NAME, mode)

    return transaction.objectStore(this.#STORE_NAME)
  }

  /**
   * Creates a storage.
   *
   * @param {IDBFactory} factory an IndexedDB factory
   * @fires ready when the storage can be accessed
   */
  constructor (factory) {
    super()
    this.#setupDatabase(factory)
  }

  /**
   * Gets the value for the given key.
   *
   * @param {string} key the key associated with the value to find
   * @returns {Promise<any>} the value for the given key
   */
  get = (key) => new Promise((resolve, reject) => {
    const request = this.#getStore('readonly').get(key)

    request.addEventListener(('success'), (ev) => { resolve(ev.target.result) })
    request.addEventListener(('error'), (ev) => { reject(ev.target.error) })
  })

  /**
   *  Saves the given value with the given key.
   *
   * @param {string} key the key to associate with the saved value
   * @param {any} value the value to save
   */
  save (key, value) {
    this.#getStore('readwrite').put(value, key)
  }
}

/**
 * Setups state persistence using the given storage on a state object
 * properties.
 *
 * When the storage is ready, makes it persist changes on the state.
 *
 * The state properties are cycled. For each of them a request is done to get
 * the stored value. If it is undefined, it is initialized with the current
 * value. Then property saving is setup as a side effect.
 *
 * @param {object} state the state to persist
 * @param {Storage} storage the storage where to keep the state
 * @listens ready
 */
const persist = (state, storage) => {
  storage.addEventListener('ready', () => {
    for (const name in state) {
      const stateItem = state[name]

      storage.get(name).then(value => {
        if (value === undefined) {
          storage.save(name, stateItem.val)
        } else {
          stateItem.val = value
        }

        van.derive(() => storage.save(name, stateItem.val))
      })
    }
  })
}

export { Storage, persist }
