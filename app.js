"use strict";

const filePathEl = document.getElementById("scan-file-path");
const fileNameEl = document.getElementById("scan-file-name");
const contentEl = document.getElementById("scan-content");

function showFileContent() {
    const reader = new FileReader();

    let file = filePathEl.files[0];

    fileNameEl.textContent = file.name;

    reader.onload = () => {
        contentEl.textContent = reader.result;
    };

    reader.readAsText(file);
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js")
            .catch(error => console.error("Service worker registration failed:", error));
    } else {
        console.error("Service workers are not supported");
    }
}

registerServiceWorker();
filePathEl.addEventListener("change", showFileContent);
