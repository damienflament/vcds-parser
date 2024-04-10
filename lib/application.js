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
     * The application window.
     * @type {Window}
     */
    #window;

    /**
     * Multi-level object containing the HTML elements used by the application.
     */
    #e = {
        directoryLabel: undefined,
        textarea: undefined,
        openLastUsedDirectoryNotification: undefined
    };

    /**
     * Retrieves the HTML elements the application whork with.
     *
     * @param {Document} document the document containing the HTML elements
     */
    #setupElements(document) {
        this.#e.directoryLabel = document.getElementById("directory-path");
        this.#e.textarea = document.getElementById("file-content");
        this.#e.openLastUsedDirectoryNotification = document.getElementById("open-last-used-directory-notification");
    }

    /**
     * Restores the application state from the configuration.
     */
    #restoreState() {
        this.openLastUsedDirectory();
    }

    /**
     * Requests permission for the given file.
     *
     * Readonly permission is queried. If necessary, permission is requested.
     *
     * The returned permission should be "granted" or "denied". If it is
     * "prompt", it means the permission must be requested due to a user
     * interaction.
     *
     * @param {FileSystemHandle} file
     * @returns {Promise<PermissionState>} the permission for the given file
     */
    async #requestPermission(file) {
        const options = { mode: "read" };

        let permission = await file.queryPermission(options);

        if (permission === "prompt") {
            // The permission must be requested. Try it.
            try {
                permission = await file.requestPermission(options);

                // If the permission is still "prompt" after we prompted the
                // user, it seems to be because he cancelled it.
                // We regard this as a bug and put the value "denied".
                if (permission === "prompt") {
                    permission = "denied";
                }
            } catch (e) {
                if (e instanceof DOMException && e.name == "SecurityError") {
                    // The permission has been requested without user interaction
                    permission = "prompt";
                }
            }
        }

        return permission;
    }

    /**
     * Loads the given directory.
     *
     * The directory name is shown in the directory label. Tabs are created for
     * `.txt` files located within the directory.
     *
     * @param {FileSystemDirectoryHandle} directory the directory to load
     */
    async #loadDirectory(directory) {
        this.#e.directoryLabel.textContent = directory.name;

        this.#e.textarea.textContent = "";

        for await (const file of directory.values()) {
            if (file.kind === "file") {
                this.#e.textarea.textContent += `${file.name}\n`;
            }
        }
    }

    /**
     * Loads the given file.
     *
     * Shows the content of the file within the textarea.
     *
     * @param {File} file the file to load
     */
    #loadFile(file) {
        const reader = new FileReader();

        this.#e.fileLabel.textContent = file.name;

        reader.onload = () => {
            this.#e.textarea.textContent = reader.result;
        };

        reader.readAsText(file);
    }

    /**
     * Creates an application working in the given window.
     *
     * @param {Window} window the application window
     */
    constructor(window) {
        this.#window = window;
        this.#setupElements(this.#window.document);

        this.config = new Configuration(this.#window.indexedDB, this.APP_ID);
        this.config.addEventListener("ready", () => {
            this.#restoreState();
        });
    }

    /**
     * Opens a directory to work in.
     *
     * The opened directory is saved within the application configuration
     * parameter {@link Configuration.openedDirectory}.
     *
     * Shows a directory picker and loads the selected directory. Only `.txt`
     * files are shown. The first one is opened.
     */
    async openDirectory() {
        try {
            const directory = await this.#window.showDirectoryPicker();

            this.config.openedDirectory = directory;

            if (directory) {
                this.#loadDirectory(directory);
            }
        } catch (e) {
            if (e instanceof DOMException && e.name == "AbortError") {
                // The user aborted the directory picker.
                return;
            }
        }
    };

    /**
     * Opens the given file.
     *
     * The opened file is saved within the application configuration parameter
     * {@link Configuration.openedFile}.
     *
     * @param {File} file the file to open
     */
    openFile(file) {
        this.config.openedFile = file;

        if (file) {
            this.#loadFile(file);
        }
    }

    /**
     * Offers the user to load the last opened directory.
     */
    offersToOpenLastUsedDirectory() {
        this.#e.openLastUsedDirectoryNotification.classList.remove("is-hidden");
    };

    openLastUsedDirectory() {
        this.config.openedDirectory.onsuccess = event => {
            const directory = event.target.result;

            if (directory) {
                this.#requestPermission(directory)
                    .then(permission => {
                        switch (permission) {
                            case "granted":
                                this.#loadDirectory(directory);
                                break;
                            case "prompt":
                                this.offersToOpenLastUsedDirectory();
                                break;
                        }
                    });
            };
        };
    }

    /**
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
     * The error message is shown in the console prefixed with the application
     * ID.
     *
     * @param {...any} data
     * @see {@link logging.error}
     */
    error(...data) {
        logging.error(`${this.APP_ID}:`, ...data);
    }
}
