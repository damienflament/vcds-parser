/**
 * The application configuration.
 *
 * The configuration is persisted through IndexedDB.
 */
export default class Configuration extends EventTarget {
    /**
     * The store name.
     */
    #STORE_NAME = "configuration";

    /**
     * The IndexedDB instance.
     *
     * @type {IDBDatabase}
     */
    #db;

    /**
     * Setups the IndexedDB database.
     *
     * @param {IDBFactory} factory an IndexedDB factory
     * @param {string} name the name of the database
     * @fires ready
     */
    #setupDatabase(factory, name) {
        const request = factory.open(name);

        request.onerror = event => {
            this.error("Failed to open the database:", event.target.error);
        };

        request.onsuccess = event => {
            this.#db = event.target.result;

            this.#db.onerror = event => {
                this.error("Database error:", event.target.errorCode);
            };

            /**
             * Event emited when the database is ready and the configuration
             * values can be accessed.
             *
             * @event ready
             */
            this.dispatchEvent(new Event("ready"));
        };

        request.onupgradeneeded = event => {
            const db = event.target.result;

            db.createObjectStore(this.#STORE_NAME);
        };
    }

    /**
     * Returns the object store within a transaction with the given mode.
     *
     * @param {IDBTransactionMode} mode the mode to open the transaction with
     */
    #store(mode) {
        const transaction = this.#db.transaction(this.#STORE_NAME, mode);

        return transaction.objectStore(this.#STORE_NAME);
    }

    /**
     * Requests the value of the specified configuration parameter.
     *
     * @param {string} name the configuration parameter name
     * @returns the request for parameter value
     */
    #get(name) {
        return this.#store("readonly").get(name);
    }

    /**
     * Sets the value of the specified configuration parameter.
     *
     * @param {string} name the name of the configuration parameter to set
     * @param {any} value the value to set
     */
    #set(name, value) {
        this.#store("readwrite").put(value, name);
    }

    /**
     * Creates a new {@link Configuration} instance.
     *
     * @param {IDBFactory} factory the factory to build the database
     * @param {string} name the name of the database storing the configuration
     * @fires ready when fully setup
     */
    constructor(factory, name) {
        super();
        this.#setupDatabase(factory, name);
    }

    /**
     * @param {((this: Configuration, ev: Event) => any) | null} callback
     */
    set onready(callback) {
        this.addEventListener("ready", callback);
    }

    /**
     * @returns {IDBRequest<File|null>}
     */
    get openedFile() {
        return this.#get("opened-file");
    }

    /**
     * @param {File|null} file
     */
    set openedFile(file) {
        this.#set("opened-file", file);
    }
}
