/**
 * Application related functions.
 * @module application
 */

/**
 * The application identifier.
 */
const APP_ID = "vcds-parser";

/**
 * The name of the configuration store.
 */
const CONFIG_STORE = "configuration";

const el = {
    file: {
        picker: document.getElementById("scan-file-path"),
        label: document.getElementById("scan-file-name")
    },
    textarea: document.getElementById("scan-content"),
}

/**
 * The IndexedDB database.
 *
 * @type {IDBDatabase}
 */
let db;

const request = window.indexedDB.open(APP_ID);

request.onerror = event => {
    console.error("Failed to open the IndexedDB:", event.target.error);
}

request.onsuccess = event => {
    db = event.target.result;

    db.onerror = event => {
        console.error("Database error:", event.target.errorCode)
    }

    reloadData();
};

request.onupgradeneeded = event => {
    db = event.target.result;

    db.createObjectStore(CONFIG_STORE);
}

/**
 * Setup event listeners on the elements.
 *
 * UI interactions are set in this function.
 */
export function setupEventListeners() {
    el.file.picker.addEventListener("change", handleFileSpecified);
}

export function reloadData() {
    const transaction = db.transaction(CONFIG_STORE, "readonly");
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get("file-handle");

    request.onsuccess = event => {
        const file = event.target.result;

        if (file) {
            const reader = new FileReader();

            el.file.label.textContent = file.name;

            reader.onload = () => {
                el.textarea.textContent = reader.result;
            };

            reader.readAsText(file);
        }
    };

}

/**
 * Handle file selection.
*
* Shows the content of the file specified in the {@link el.file.picker} within
* the {@link el.textarea}.
* The filename is shown in the {@link el.file.label}.
*/
export function handleFileSpecified() {
    const file = el.file.picker.files[0];
    const transaction = db.transaction(CONFIG_STORE, "readwrite");
    const store = transaction.objectStore(CONFIG_STORE);

    store.put(file, "file-handle");

    if (file) {
        const reader = new FileReader();

        el.file.label.textContent = file.name;

        reader.onload = () => {
            el.textarea.textContent = reader.result;
        };

        reader.readAsText(file);
    }
}

/**
 * Logs a message made from the given arguments.
 *
 * The message is shown in the console.
 */
export function log() {
    console.log(`${APP_ID}:`, ...arguments);
}

/**
 * Shows an error message made from the given arguments.
 *
 * The error message is shown in the console.
 */
export function error() {
    console.error(`${APP_ID}:`, ...arguments);
}
