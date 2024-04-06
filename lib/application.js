import * as logging from "./logging.js";
import Configuration from "./configuration.js";

/**
 * The application.
 *
 * Should be used through a unique instance.
 */
export default class Application {
    /**
     * The application identifier.
     */
    APP_ID = "vcds-parser";

    /**
     * The application configuration.
     * @type {Configuration}
     */
    config;

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
            fileLabel: document.getElementById("scan-file-name"),
            textarea: document.getElementById("scan-content"),
        };
    }

    /**
     * Restores the application state from the configuration.
     */
    #restoreState() {
        this.config.openedFile.onsuccess = event => {
            const file = event.target.result;

            (file) && this.#openFile(file);
        };
    }

    #openFile(file) {
        const reader = new FileReader();

        this.#e.fileLabel.textContent = file.name;

        reader.onload = () => {
            this.#e.textarea.textContent = reader.result;
        };

        reader.readAsText(file);
    }

    /**
     * Opens the given {@link file}.
     *
     * Shows the content of the file within the textarea. The filename is shown
     * in the file label. The file opened file is saved within the application
     * configuration parameter {@link Configuration.openedFile}.
     *
     * @param {*} file
     */
    openFile(file) {
        this.config.openedFile = file;

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

        this.config = new Configuration(window.indexedDB, this.APP_ID);
        this.config.addEventListener("ready", () => {
            this.#restoreState();
        });
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
