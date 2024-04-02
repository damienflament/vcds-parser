/**
 * Application related functions.
 */
const APP_ID = "vcds-parser";

const el = {
    file: {
        picker: document.getElementById("scan-file-path"),
        label: document.getElementById("scan-file-name")
    },
    textarea: document.getElementById("scan-content"),
}

/**
 * Setup event listeners on the elements.
 *
 * UI interactions are set in this function.
 */
export function setupEventListeners() {
    el.file.picker.addEventListener("change", handleFileSpecified);
}

/**
 * Handle file selection.
 *
 * Shows the content of the file specified in the {@link el.file.picker} within
 * the {@link el.textarea}.
 * The filename is shown in the {@link el.file.label}.
 */
export function handleFileSpecified() {
    const reader = new FileReader();

    let file = el.file.picker.files[0];

    if (file) {
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
