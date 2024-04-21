/**
 * Data storage.
 * @module
 */

import van from './van.js'

/**
 * A storage using an Indexed Database with a unique store.
 *
 * @fires Storage#ready when the storage can be accessed
 */
export class Storage extends EventTarget {
  #DB_NAME = 'storage'
  #STORE_NAME = 'store'

  /** @type {IDBDatabase} */
  #db

  /**
   * Setups the IndexedDB database.
   *
   * @param {IDBFactory} factory an IndexedDB factory
   * @param {string} name the name of the database
   * @fires Storage#ready
   */
  #setupDatabase (factory) {
    const request = factory.open(this.#DB_NAME)

    request.onsuccess = ev => {
      this.#db = ev.target.result

      /**
       * Event emited when the storage can be accessed
       *
       * @event Storage#ready
       */
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
   * @fires Storage#ready
   */
  constructor (factory) {
    super()
    this.#setupDatabase(factory)
  }

  /**
   * Requests the value for the given key and passes it to the given callback
   * when ready.
   *
   * @param {string} key
   * @param {(any) => any} callback
   */
  request (key, callback) {
    this.#getStore('readonly').get(key).onsuccess = (ev) => callback(ev.target.result)
  }

  /**
   *  Saves the given value with the given key.
   *
   * @param {string} key the key to find the saved value
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
 * the stored value. Then property saving is setup as a side effect.
 *
 * @param {object} state the state to persist
 * @param {Storage} storage the storage where to keep the state
 */
export function persist (state, storage) {
  storage.addEventListener('ready', () => {
    for (const name in state) {
      const stateItem = state[name]

      storage.request(name, (value) => {
        stateItem.val = value

        van.derive(() => storage.save(name, stateItem.val))
      })
    }
  })
};
