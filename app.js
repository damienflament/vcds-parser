"use strict";

const filePathEl = document.getElementById("scan-file-path");
const fileNameEl = document.getElementById("scan-file-name");
const contentEl = document.getElementById("scan-content");

/**
 * Shows the content of the file specified in the {@link filePathEl} within
 * the {@link contentEl}.
 */
function showFileContent() {
    const reader = new FileReader();

    let file = filePathEl.files[0];

    if (file) {
        fileNameEl.textContent = file.name;

        reader.onload = () => {
            contentEl.textContent = reader.result;
        };

        reader.readAsText(file);
    }
}

/**
 * Registers the specified Service Worker.
 *
 * @param {string} path the path to the file to register
 */
function registerServiceWorker(path) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(path)
            .catch(error => console.error("Service worker registration failed:", error));
    } else {
        console.error("Service workers are not supported");
    }
}

registerServiceWorker("sw.js");
filePathEl.addEventListener("change", showFileContent);
