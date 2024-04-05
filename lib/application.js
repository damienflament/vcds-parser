/**
 * Application related functions.
 * @module application
 */

import * as logging from "./logging.js";

/**
 * The application.
 *
 * Should be used through a unique instance.
 */
export class Application {
    /**
     * The application identifier.
     */
    APP_ID = "vcds-parser";

    /**
     * The configuration store name.
     */
    CONFIG_STORE = "configuration";

    /**
     * Multi-level object containing the HTML elements used by the application.
     */
    #e;

    /**
     * Retrieves the HTML elements the application whork with.
     *
     * @param {Document} document the document containing the HTML elements
     */
    #setupElements(document) {
        this.#e = {
            file: {
                picker: document.getElementById("scan-file-path"),
                label: document.getElementById("scan-file-name")
            },
            textarea: document.getElementById("scan-content"),
        };
    }

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
     */
    #setupDatabase(factory) {
        const request = factory.open(this.APP_ID);

        request.onerror = event => {
            this.error("Failed to open the database:", event.target.error);
        };

        request.onsuccess = event => {
            this.#db = event.target.result;

            this.#db.onerror = event => {
                this.error("Database error:", event.target.errorCode);
            };

            this.#restoreState();
        };

        request.onupgradeneeded = event => {
            const db = event.target.result;

            db.createObjectStore(this.CONFIG_STORE);
        };
    }

    /**
     * Sets the {@link value} of the configuration parameter {@link name}.
     *
     * The configuration is persisted using IndexedDB.
     *
     * @param {string} name the name of the configuration parameter to set
     * @param {any} value the value to set
     */
    #setConfig(name, value) {
        const transaction = this.#db.transaction(this.CONFIG_STORE, "readwrite");
        const store = transaction.objectStore(this.CONFIG_STORE);

        store.put(value, name);
    }

    /**
     * Requests the value of the configuration parameter {@link name}.
     *
     * @param {string} name the configuration parameter name
     * @returns the request for parameter value
     */
    #requestConfig(name) {
        const transaction = this.#db.transaction(this.CONFIG_STORE, "readonly");
        const store = transaction.objectStore(this.CONFIG_STORE);

        return store.get(name);
    }

    #restoreState() {
        this.#requestConfig("opened-file").onsuccess = event => {
            const file = event.target.result;

            if (file) {
                this.#openFile(file);
            }
        };
    }

    #openFile(file) {
        const reader = new FileReader();

        this.#e.file.label.textContent = file.name;

        reader.onload = () => {
            this.#e.textarea.textContent = reader.result;
        };

        reader.readAsText(file);
    }

    /**
     * Opens the given {@link file}.
     *
     * Shows the content of the file within the textarea.
     * The filename is shown in the file label.
     *
     * @param {*} file
     */
    openFile(file) {
        this.#setConfig("opened-file", file);

        if (file) {
            this.#openFile(file);
        }
    }

    /**
     * Creates an application working in the given {@link window}.
     *
     * @param {Window} window the application window
     */
    constructor(window) {
        this.#setupElements(window.document);
        this.#setupDatabase(window.indexedDB);
    }

    /**
     *{@link logging.log}
     * Logs a message made from the given data.
    *
    * The message is shown in the console prefixed with the application ID.
    *
    * @param {...any} data
    * @see {@link logging.log}
    */
    log(...data) {
        logging.log(`${this.APP_ID}:`, ...data);
    }

    /**
     * Shows an error message made from the given data.
     *
     * The error message is shown in the console prefixed with the
     * application ID.
     *
     * @param {...any} data
     * @see {@link logging.error}
     */
    error(...data) {
        logging.error(`${this.APP_ID}:`, ...data);
    }
}
